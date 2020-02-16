import React from 'react';
import { Card, message } from 'antd';
import PageLoading from '@/components/PageLoading';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import OrgChart from 'react-orgchart';
import 'react-orgchart/index.css';
import styles from './style.less';
import { LoginInfo } from '@/models/login';
import PersonPositionView from './components/PersonPositionView';

const initechOrg = {
  name: 'Bill Lumbergh',
  actor: 'Gary Cole',
  children: [
    {
      name: 'Peter Gibbons',
      actor: 'Ron Livingston',
      children: [
        {
          name: 'And More!!',
          actor:
            'This is just to show how to build a complex tree with multiple levels of children. Enjoy!',
        },
      ],
    },
    {
      name: 'Milton Waddams',
      actor: 'Stephen Root',
    },
    {
      name: 'Bob Slydell',
      actor: 'John C. McGi...',
    },
  ],
};

interface PositionState {
  positionData?: any;
  infoVisible: boolean;
  personInfo?: any;
}

class PositionStructure extends React.Component {
  state: PositionState = {
    infoVisible: false,
  };
  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(
    localStorage.getItem('LoginInfo') as string,
  );
  private token: string = '';

  componentDidMount() {
    this.token =
      'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
    this.getPositionDataBySite(1);
  }

  myNodeComponent = (node: any) => {
    let data = node.node;
    return (
      <div className={styles.initechNodeBg}>
        <div className={styles.initechNodeTitle}>{data.position}</div>
        <div
          className={styles.initechNode}
          style={{ cursor: 'pointer' }}
          onClick={() => this.showPersonInfo(data.id)}
        >
          {data.name}
        </div>
      </div>
    );
  };

  showPersonInfo = (personId: number) => {
    if (!personId) {
      message.error('没有用户id，无法显示详情');
      return;
    }

    if (!this.loginData) return;
    this.setState({
      infoVisible: true,
      personInfo: null,
    });

    return fetch('/api/person/detail/byid', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        person_id: personId,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.setState({
            infoVisible: true,
            personInfo: json.response,
          });
        }
      });
  };

  getPositionDataBySite = (siteId: number) => {
    if (!this.loginData) return;

    return fetch('/api/site/ochart', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        site_id: siteId,
      }),
    })
      .then(response => response.json())
      .then(json => {
        this.setState({
          positionData: json.response[0],
        });
      });
  };

  handleInfoCancel = () => {
    this.setState({
      infoVisible: false,
    });
  };

  render() {
    console.log('--------------positionData: ', this.state.positionData);
    if (!this.state.positionData) {
      return <PageLoading />;
    }
    return (
      <PageHeaderWrapper>
        <Card>
          <OrgChart
            pan={true}
            tree={this.state.positionData}
            NodeComponent={this.myNodeComponent}
          />
        </Card>

        <PersonPositionView
          visible={this.state.infoVisible}
          onCancel={this.handleInfoCancel}
          personInfo={this.state.personInfo}
        />
      </PageHeaderWrapper>
    );
  }
}

export default PositionStructure;
