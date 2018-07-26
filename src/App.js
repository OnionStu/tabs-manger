import React, { Component } from 'react';
import { Layout, Card, Avatar, Icon, Row, Col, Input } from 'antd';
import classNames from 'classnames';

import { sendMessage, updateTab, getTab, deleteTabs, tabStatus, reloadTab } from './utils';
import './app.less';

const { Header, Content } = Layout;
const { Meta } = Card;
const { Search } = Input;

class App extends Component {
  state = { tabs: [], searchValue: '' };

  async componentDidMount() {
    const { tabs } = await sendMessage({ msg: 'getTabs' });
    // tabs.forEach(tab => {
    //   captures[tab.id] && (tab.capture = captures[tab.id]);
    // });
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
    const valueReg = eval(`/${str}/i`);
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
    const itemLayout = { sm: 12, md: 12, xl: 8, xxl: 6 },
      { tabs, searchValue } = this.state;
    const tabList = this.tabsFilter(tabs, searchValue);
    return (
      <Layout className="main-layout">
        <Header>
          <span className="header-title">当前打开的标签：</span>
          <Search className="header-search" onChange={this.handleSearchChange} />
        </Header>
        <Content>
          <Row gutter={20} type="flex" className="tab-list">
            {tabList &&
              tabList.map(tab => {
                const cardClass = classNames({ 'active-tab': tab.active });
                const pushpinIcon = `pushpin${tab.pinned ? '' : '-o'}`;
                return (
                  <Col key={tab.id} className="tab-item" {...itemLayout}>
                    <Card
                      className={cardClass}
                      bordered
                      cover={<img src={tab.capture} alt={tab.title} />}
                      actions={[
                        <Icon type={pushpinIcon} data-tabid={tab.id} onClick={this.handlePushpin} />,
                        <Icon
                          type="reload"
                          spin={tab.status === tabStatus.LOADING}
                          data-tabid={tab.id}
                          onClick={this.handleReload}
                        />,
                        <Icon type="close" data-tabid={tab.id} onClick={this.handleClose} />
                      ]}
                    >
                      <Meta
                        data-tabid={tab.id}
                        onClick={this.handleCardClick}
                        title={tab.title}
                        description={tab.url}
                        avatar={tab.favIconUrl ? <Avatar src={tab.favIconUrl} /> : <Icon type="file" />}
                      />
                    </Card>
                  </Col>
                );
              })}
          </Row>
        </Content>
      </Layout>
    );
  }
}

export default App;
