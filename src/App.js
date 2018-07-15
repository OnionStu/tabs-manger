import React, { Component } from 'react';
import { Layout, Card, Avatar, Icon, Row, Col } from 'antd';
import classNames from 'classnames';

import tabs from './tabs.json';
import pic from './pic.png';
import './app.less';

const { Header, Content } = Layout;
const { Meta } = Card;

class App extends Component {
  render() {
    const itemLayout = { md: 12, xl:8, xxl:6 }
    return (
      <Layout className="main-layout">
        <Header><h1>当前打开的标签：</h1></Header>
        <Content>
          <Row gutter={20} type="flex" className="tab-list">
            {tabs &&
              tabs.map(tab => {
                const cardClass = classNames({'active-tab':tab.active})

                return (
                  <Col key={tab.id} className="tab-item" {...itemLayout}>
                    <Card
                      className={cardClass}
                      bordered
                      cover={<img src={pic} alt={tab.title} />}
                      actions={[<Icon type="pushpin-o" />, <Icon type="reload" />, <Icon type="close" />]}
                    >
                      <Meta title={tab.title} description={tab.url} avatar={<Avatar src={tab.favIconUrl} />} />
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
