import React, { Component } from 'react';
import { Layout, Card, Avatar, Icon, Row, Col, Input, Radio, List as AntdList } from 'antd';
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

const Cards = ({ tabs, handlePinning, handleReload, handleClose, handleSelect }) => {
  const itemLayout = { sm: 12, md: 12, xl: 8, xxl: 6 };
  return (
    <Row gutter={20} type="flex" className="tab-cards">
      {tabs &&
        tabs.map(tab => {
          const cardClass = classNames({ 'active-tab': tab.active });

          return (
            <Col key={tab.id} className="tab-item" {...itemLayout}>
              <Card
                className={cardClass}
                bordered
                cover={<img src={tab.capture} alt={tab.title} />}
                actions={[
                  <PushpinIcon tab={tab} handleClick={handlePinning} />,
                  <ReloadIcon tab={tab} handleClick={handleReload} />,
                  <CloseIcon tab={tab} handleClick={handleClose} />
                ]}
              >
                <Meta
                  data-tabid={tab.id}
                  onClick={handleSelect}
                  title={tab.title}
                  description={tab.url}
                  avatar={tab.favIconUrl ? <Avatar src={tab.favIconUrl} /> : <Icon type="file" />}
                />
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
  state = { display: displayTypes.CARDS, tabs: [], searchValue: '' };

  async componentDidMount() {
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
    const el = event.currentTarget;
    if (el.classList.contains('active-tab')) return;
    const { dataset } = el;
    const tabId = +dataset.tabid;
    updateTab(tabId, { active: true });
  };

  handleSearchChange = event => {
    const el = event.currentTarget;
    this.setState(() => ({ searchValue: el.value }));
  };

  handleDisplayChange = event => {
    const el = event.target;
    this.setState(() => ({ display: el.value }));
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
    const valueReg = new RegExp(str, 'i');
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
            <Search className="header-search" onChange={this.handleSearchChange} />
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
