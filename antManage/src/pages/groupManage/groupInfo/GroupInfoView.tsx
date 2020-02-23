import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { ConnectState } from '@/models/connect';
import { connect } from 'dva';
import { LoginStateType, LoginInfo } from '@/models/login';
import { Descriptions, Button, Card, Modal, Form, Input, Checkbox } from 'antd';
import GroupDetailInfo from './components/GroupDetailInfo';

interface GroupInfoProps {
  userLogin: LoginStateType;
}

interface GroupInfo {
  id: number;
  group_id: number;
  person_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  group: GroupData;
}

interface GroupData {
  id: number;
  name: string;
  channel: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  authority: GroupAuthority[];
}

interface GroupAuthority {
  id: number;
  group_id: number;
  authority_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  enum: { id: number; name: string }[];
}

interface GroupState {
  visible: boolean;
  showType: number;
  groupInfo?: GroupInfo;
  authorityList: any;
  infoVisible: boolean;
  detailInfo?: any;
}

const CollectionCreateForm = Form.create({ name: 'form_in_modal' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, groupState, onCancel, onCreate, form } = this.props as any;
      const { getFieldDecorator } = form;
      const { groupInfo, showType, authorityList } = groupState;

      let authorityValue: number[] = [];
      if (groupInfo && groupInfo.group) {
        groupInfo.group.authority.forEach((data: GroupAuthority) => {
          authorityValue.push(data.enum[0].id);
        });
      }
      if (showType != 0 && !authorityList) return null;
      const view =
        showType === 0 ? (
          <Form layout="vertical">
            <Form.Item label="集团名称">
              {getFieldDecorator('name', {
                initialValue: groupInfo.group.name,
                rules: [{ required: true, message: '请输入集团名称！' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="渠道名称">
              {getFieldDecorator('channel', {
                initialValue: groupInfo.group.channel,
                rules: [{ required: true, message: '请输入渠道名称!' }],
              })(<Input />)}
            </Form.Item>
          </Form>
        ) : (
          <Form layout="vertical">
            <Form.Item label="授权">
              {getFieldDecorator('authority', {
                initialValue: authorityValue,
              })(
                <Checkbox.Group style={{ width: '100%' }}>
                  {authorityList.map((data: any, key: string) => {
                    return (
                      <Checkbox key={data.id} value={data.id}>
                        {data.name}
                      </Checkbox>
                    );
                  })}
                </Checkbox.Group>,
              )}
            </Form.Item>
          </Form>
        );
      return (
        <Modal
          visible={visible}
          title={showType === 0 ? '修改集团信息' : '修改授权信息'}
          okText="确定"
          onCancel={onCancel}
          onOk={onCreate}
        >
          {view}
        </Modal>
      );
    }
  },
);

@connect(({ login }: ConnectState) => ({
  userLogin: login,
}))
class GroupInfoView extends React.Component<GroupInfoProps> {
  state: GroupState = {
    infoVisible: false,
    visible: false,
    showType: -1,
    authorityList: null,
  };

  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(
    localStorage.getItem('LoginInfo') as string,
  );
  private token: string = '';

  componentDidMount() {
    this.token =
      'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
    this.getGroupInfo();
    this.getAuthorityInfo();
  }

  getGroupInfo = () => {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;

    return fetch('/api/group/detail/byadmin', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: loginInfo.id,
      }),
    })
      .then(response => response.json())
      .then(json => {
        this.setState({
          groupInfo: json.response,
        });
      });
  };

  getAuthorityInfo = () => {
    if (!this.loginData) return;

    return fetch('/api/enum/authority/list', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
    })
      .then(response => response.json())
      .then(json => {
        this.setState({
          authorityList: json.response,
        });
      });
  };

  editGroupInfo(value: any) {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;
    return fetch('/api/group/update', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: loginInfo.id,
        group_id: this.state.groupInfo ? this.state.groupInfo.group_id : '',
        name: value.name,
        channel: value.channel,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) this.getGroupInfo();
      });
  }

  getAuthorityView = () => {
    let dscr: string = '';
    if (this.state.groupInfo) {
      this.state.groupInfo.group.authority.forEach((data: any) => {
        data.enum.forEach((item: any) => {
          dscr += ' ' + item.name;
        });
      });
    }
    return dscr;
  };

  showModal = () => {
    this.setState({ visible: true, showType: 0 });
  };

  showAuthority = () => {
    this.setState({ visible: true, showType: 1 });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = () => {
    const { form } = this.formRef.props;
    form.validateFields((err: any, values: any) => {
      if (err) {
        return;
      }

      console.log('Received values of form: ', values);
      if (this.state.showType === 0) {
        this.editGroupInfo(values);
      } else {
        let authorityList: number[] = [];
        let valueList: number[] = values.authority;
        if (this.state.groupInfo) {
          const { groupInfo } = this.state;
          groupInfo.group.authority.forEach((data: GroupAuthority) => {
            authorityList.push(data.enum[0].id);
          });
        }

        valueList.forEach((id: number) => {
          let index: number = authorityList.indexOf(id);
          if (index >= 0) {
            authorityList.splice(index, 1);
          } else {
            this.addAuthority(id);
          }
        });

        authorityList.forEach((id: number) => {
          this.deleteAuthority(id);
        });
      }
      form.resetFields();
      this.setState({ visible: false });
    });
  };

  addAuthority = (authority_id: number) => {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;

    return fetch('/api/group/authority/append', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: loginInfo.id,
        authority_id: authority_id,
        group_id: this.state.groupInfo ? this.state.groupInfo.group_id : '',
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) this.getGroupInfo();
      });
  };

  deleteAuthority = (authority_id: number) => {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;

    return fetch('/api/group/authority/remove', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: loginInfo.id,
        authority_id: authority_id,
        group_id: this.state.groupInfo ? this.state.groupInfo.group_id : '',
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) this.getGroupInfo();
      });
  };

  private formRef: any;
  saveFormRef = (formRef: any) => {
    this.formRef = formRef;
  };

  showDetailInfo = () => {
    if (!this.loginData) return;

    this.setState({
      infoVisible: true,
      detailInfo: null,
    });

    return fetch('/api/group/detail/byid', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        group_id: this.state.groupInfo?.group_id,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.setState({
            infoVisible: true,
            detailInfo: json.response,
          });
        }
      });
  };

  hideDetailInfo = () => {
    this.setState({
      infoVisible: false,
    });
  };

  render() {
    if (!this.state.groupInfo) {
      return <PageLoading />;
    }

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <Descriptions layout="vertical" bordered>
            <Descriptions.Item label="集团名称">
              <div
                style={{ color: 'blue', cursor: 'pointer' }}
                onClick={() => {
                  this.showDetailInfo();
                }}
              >
                {this.state.groupInfo.group.name}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="渠道名称">
              {this.state.groupInfo.group.channel}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {this.state.groupInfo.created_at}
            </Descriptions.Item>
            <Descriptions.Item label="集团授权">{this.getAuthorityView()}</Descriptions.Item>
            <Descriptions.Item label="集团RSM">
              姓名:{this.state.groupInfo.group.rsm.name} 联系方式:
              {this.state.groupInfo.group.rsm.mobile}
            </Descriptions.Item>
          </Descriptions>
          <br />
          <br />
          <br />
          <div>
            <Button type="primary" onClick={this.showModal}>
              修改集团信息
            </Button>
            <Button style={{ marginLeft: 15 }} type="primary" onClick={this.showAuthority}>
              修改授权
            </Button>
          </div>

          <CollectionCreateForm
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
            groupState={this.state}
          />

          <GroupDetailInfo
            visible={this.state.infoVisible}
            onCancel={this.hideDetailInfo}
            detailInfo={this.state.detailInfo}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default GroupInfoView;
