import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { Layout, Card, Avatar, Icon, Row, Col, Input, Radio, List as AntdList, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import classNames from 'classnames';

import { sendMessage, updateTab, getTab, deleteTabs, tabStatus, reloadTab } from './utils';
import './app.less';

const { Header, Content } = Layout;
const { Meta } = Card;
const { Search } = Input;
const RadioGroup = Radio.Group;
const RadioBtn = Radio.Button;

const displayTypes = { CARDS: 'cards', LIST: 'list' };

const PushpinIcon = ({ tab, handleClick }) => {
  const icon = `pushpin${tab.pinned ? '' : '-o'}`;
  return <Icon type={icon} data-tabid={tab.id} onClick={handleClick} />;
};

const ReloadIcon = ({ tab, handleClick }) => (
  <Icon type="reload" spin={tab.status === tabStatus.LOADING} data-tabid={tab.id} onClick={handleClick} />
);

const CloseIcon = ({ tab, handleClick }) => <Icon type="close" data-tabid={tab.id} onClick={handleClick} />;

const CardDescription = ({ text }) => {
  const handleCopy = () => message.success('复制成功');

  return (
    <div className="copy-wrapper">
      <span>{text}</span>
      <CopyToClipboard text={text} onCopy={handleCopy}>
        <Icon type="copy" className="copy-btn" title="复制URL" />
      </CopyToClipboard>
    </div>
  );
};
const Cards = ({ tabs, handlePinning, handleReload, handleClose, handleSelect }) => {
  const itemLayout = { sm: 12, md: 12, xl: 8, xxl: 6 };
  return (
    <Row gutter={20} type="flex" className="tab-cards">
      {tabs &&
        tabs.map(tab => {
          const cardClass = classNames({ 'active-tab': tab.active }),
            cover = <img src={tab.capture} alt={tab.title} />,
            actions = [
              <PushpinIcon tab={tab} handleClick={handlePinning} />,
              <ReloadIcon tab={tab} handleClick={handleReload} />,
              <CloseIcon tab={tab} handleClick={handleClose} />
            ],
            desc = <CardDescription text={tab.url} />,
            avatar = tab.favIconUrl ? <Avatar src={tab.favIconUrl} /> : <Icon type="file" />;
          return (
            <Col key={tab.id} className="tab-item" {...itemLayout}>
              <Card className={cardClass} bordered cover={cover} actions={actions}>
                <Meta data-tabid={tab.id} onClick={handleSelect} title={tab.title} description={desc} avatar={avatar} />
              </Card>
            </Col>
          );
        })}
    </Row>
  );
};

const List = ({ tabs, handlePinning, handleReload, handleClose, handleSelect }) => {
  return (
    <AntdList
      className="tab-list"
      bordered
      itemLayout="vertical"
      size="large"
      dataSource={tabs}
      renderItem={tab => (
        <AntdList.Item
          key={tab.title}
          actions={[
            <PushpinIcon tab={tab} handleClick={handlePinning} />,
            <ReloadIcon tab={tab} handleClick={handleReload} />,
            <CloseIcon tab={tab} handleClick={handleClose} />
          ]}
          extra={<img alt="capture" src={tab.capture} />}
        >
          <AntdList.Item.Meta
            avatar={<Avatar src={tab.favIconUrl} />}
            title={
              <a data-tabid={tab.id} onClick={handleSelect}>
                {tab.title}
              </a>
            }
            // description={tab.url}
          />
          {tab.url}
        </AntdList.Item>
      )}
    />
  );
};

class App extends Component {
  searchRef = React.createRef();

  state = { display: displayTypes.CARDS, tabs: [], searchValue: '' };

  async componentDidMount() {
    // 本地调试用
    // const tabs = require('./tabs.json');
    // console.log(tabs);
    // this.setState(() => ({ tabs }));
    // return;
    const { tabs } = await sendMessage({ msg: 'getTabs' });
    this.setState(() => ({ tabs }));
    chrome.runtime.onMessage.addListener(this.handleReceiveMsg);
  }

  handleReceiveMsg = (params, sender, sendResponse) => {
    const { msg, tabId, tab, tabs } = params;
    switch (msg) {
      case 'updateTab':
        this.updateTab(tabId, tab);
        break;
      case 'updateTabs':
        this.setState(() => ({ tabs }));
        break;
      case 'deleteTab':
        this.setState(prevState => ({ tabs: prevState.tabs.filter(tab => tab.id !== tabId) }));
        break;
      default:
        break;
    }

    return true;
  };

  handlePushpin = async event => {
    event.stopPropagation();
    const { dataset } = event.currentTarget;
    const tabId = +dataset.tabid;
    const tab = await getTab(tabId);
    updateTab(tabId, { pinned: !tab.pinned });
  };

  handleReload = event => {
    event.stopPropagation();
    const { dataset } = event.currentTarget;
    const tabId = +dataset.tabid;
    reloadTab(tabId);
  };

  handleClose = async event => {
    event.stopPropagation();
    const { dataset } = event.currentTarget;
    const tabId = +dataset.tabid;
    await deleteTabs(tabId);
    this.setState(prevState => ({ tabs: prevState.tabs.filter(tab => tab.id !== tabId) }));
  };

  handleCardClick = event => {
    const { target, currentTarget } = event;
    if (target.classList.contains('copy-btn')) return;
    if (currentTarget.classList.contains('active-tab')) return;
    const { dataset } = currentTarget;
    const tabId = +dataset.tabid;
    updateTab(tabId, { active: true });
  };

  handleSearchChange = event => {
    const el = event.currentTarget;
    const searchValue = el.value;
    this.changeSearchIcon(searchValue);
    this.setState(() => ({ searchValue }));
  };

  handleSearchCancel = (value, event) => {
    const el = event.target;
    const isCancel = el.classList.contains('anticon-close');
    if (!isCancel) return;
    this.setState(() => ({ searchValue: '' }));
    this.changeSearchIcon();
  };

  handleDisplayChange = event => {
    const el = event.target;
    this.setState(() => ({ display: el.value }));
  };

  changeSearchIcon = value => {
    const node = findDOMNode(this.searchRef.current);
    if (!node) return;
    const iconNode = node.querySelector('.ant-input-search-icon');
    const seachIcon = 'anticon-search',
      closeIcon = 'anticon-close';
    if (!iconNode) return;
    const { classList } = iconNode;
    if (!value) return classList.replace(closeIcon, seachIcon);
    if (classList.contains(closeIcon)) return;
    classList.replace(seachIcon, closeIcon);
  };

  /**
   * 标签过滤
   * @param {Array} tabs 要过滤的标签列表
   * @param {String} str 搜索的关键字
   * @memberof App
   */
  tabsFilter = (tabs, str) => {
    if (!str) return tabs;
    if (!str.trim()) return tabs;
    const chineseReg = /[\u4e00-\u9fa5]/g;
    const hasChinese = chineseReg.test(str);
    // 转移特殊字符
    const keyChars = '!@#$%^&*()_+-={}[]|\\;:\'",./<>?`~';
    const regStr = str.split('').map(s => keyChars.indexOf(s)>0?`\\${s}`:s).join('');
    const valueReg = new RegExp(regStr, 'i');
    console.log('valueReg', valueReg);
    const result = tabs.filter(tab => {
      // 如果 没有中文，就只匹配url，如果url有包含关键字 返回true
      if (!hasChinese && valueReg.test(tab.url)) return true;
      // 如果有 中文，就再匹配标题
      return valueReg.test(tab.title);
    });
    return result;
  };

  updateTab = (tabId, newTab) => {
    this.setState(prevState => {
      const currTabs = prevState.tabs;
      const tabs = currTabs.map(tab => {
        if (tab.id === tabId) return Object.assign({}, tab, newTab);
        return tab;
      });
      return { tabs };
    });
  };

  render() {
    const { tabs, searchValue, display } = this.state;
    const tabList = this.tabsFilter(tabs, searchValue);
    const contentsProps = {
      tabs: tabList,
      handleClose: this.handleClose,
      handlePinning: this.handlePushpin,
      handleReload: this.handleReload,
      handleSelect: this.handleCardClick
    };
    return (
      <Layout className="main-layout">
        <Header>
          <Row type="flex">
            <span className="header-title">
              {searchValue
                ? `当前打开了${tabList.length}个有关于“${searchValue}”的标签`
                : `当前窗口打开了${tabList.length}个标签：`}
            </span>
            <Search
              className="header-search"
              value={searchValue}
              onChange={this.handleSearchChange}
              ref={this.searchRef}
              onSearch={this.handleSearchCancel}
            />
            <div className="header-trigger">
              <RadioGroup value={display} buttonStyle="solid" onChange={this.handleDisplayChange}>
                <RadioBtn value={displayTypes.CARDS}>
                  <Icon type="appstore" />
                </RadioBtn>
                <RadioBtn value={displayTypes.LIST}>
                  <Icon type="bars" />
                </RadioBtn>
              </RadioGroup>
            </div>
          </Row>
        </Header>
        <Content>
          {(() => {
            if (display === displayTypes.CARDS) return <Cards {...contentsProps} />;
            if (display === displayTypes.LIST) return <List {...contentsProps} />;
            return null;
          })()}
        </Content>
      </Layout>
    );
  }
}

export default App;
