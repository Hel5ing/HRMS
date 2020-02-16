import React, { Component } from 'react';
import { Card, Alert } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import 'react-orgchart/index.css';
import { LoginInfo } from '@/models/login';
import router from 'umi/router';

class Welcome extends Component {
  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(
    localStorage.getItem('LoginInfo') as string,
  );

  render() {
    if (!this.loginData) {
      router.push('/user/login');
      // window.location.href = '/user/login';
    }

    return (
      <PageHeaderWrapper>
        <Card>
          <Alert
            message="欢迎使用惠普管理系统"
            type="success"
            showIcon
            banner
            style={
              {
                // margin: -12,
                // marginBottom: 24,
              }
            }
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Welcome;
