import React, { Component } from 'react';
import { Layout, Card, Avatar, Icon, Row, Col } from 'antd';
import classNames from 'classnames';

import { sendMessage, updateTab, getTab, deleteTabs, tabStatus, reloadTab } from './utils';
import './app.less';

const { Header, Content } = Layout;
const { Meta } = Card;

class App extends Component {
  state = { tabs: [] };

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
      { tabs } = this.state;
    return (
      <Layout className="main-layout">
        <Header>
          <h1>当前打开的标签：</h1>
        </Header>
        <Content>
          <Row gutter={20} type="flex" className="tab-list">
            {tabs &&
              tabs.map(tab => {
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
