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
    const { tabs, captures } = await sendMessage('getTabs');
    tabs.forEach(tab => {
      captures[tab.id] && (tab.capture = captures[tab.id]);
    });
    this.setState(() => ({ tabs }));
  }

  handlePushpin = async event => {
    const { dataset } = event.target;
    if (dataset && dataset.tabid) {
      const tabId = +dataset.tabid;
      const tab = await getTab(tabId);
      const newTab = await updateTab(tabId, { pinned: !tab.pinned });
      this.setState(prevState => {
        const { tabs } = prevState;
        tabs[dataset.index] = newTab;
        return { tabs };
      });
    }
  };

  handleReload = event => {
    const { dataset } = event.target;
    const tabId = +dataset.tabid;
    reloadTab(tabId);
  };
  handleClose = async event => {
    const { dataset } = event.target;
    const tabId = +dataset.tabid;
    await deleteTabs(tabId);
    this.setState(prevState => ({ tabs: prevState.tabs.filter(tab => tab.id !== tabId) }));
  };

  render() {
    const itemLayout = { md: 12, xl: 8, xxl: 6 },
      { tabs } = this.state;
    return (
      <Layout className="main-layout">
        <Header>
          <h1>当前打开的标签：</h1>
        </Header>
        <Content>
          <Row gutter={20} type="flex" className="tab-list">
            {tabs &&
              tabs.map((tab, index) => {
                const cardClass = classNames({ 'active-tab': tab.active });
                const pushpinIcon = `pushpin${tab.pinned ? '' : '-o'}`;
                return (
                  <Col key={tab.id} className="tab-item" {...itemLayout}>
                    <Card
                      className={cardClass}
                      bordered
                      cover={<img src={tab.capture} alt={tab.title} />}
                      actions={[
                        <Icon type={pushpinIcon} data-tabid={tab.id} data-index={index} onClick={this.handlePushpin} />,
                        <Icon
                          type="reload"
                          spin={tab.status === tabStatus.LOADING}
                          data-tabid={tab.id}
                          data-index={index}
                          onClick={this.handleReload}
                        />,
                        <Icon type="close" data-tabid={tab.id} data-index={index} onClick={this.handleClose} />
                      ]}
                    >
                      <Meta
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
