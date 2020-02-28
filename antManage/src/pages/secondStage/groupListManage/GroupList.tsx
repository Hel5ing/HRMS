import React from 'react';
import {
  Table,
  Button,
  Card,
  Form,
  Input,
  Modal,
  message,
  Select,
  Row,
  Col,
  FormItem,
  Checkbox,
} from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { LoginInfo } from '@/models/login';
import { FormComponentProps } from 'antd/lib/form';
import styles from '../style.less';
import GroupDetailInfo from './components/GroupDetailInfo';

interface StateData {
  formVisible: boolean;
  pagination: { current: number; total: number };
  dataList: any[];
  authorityList?: any[];
  dataInfo?: any;
  infoVisible: boolean;
  detailInfo?: any;
  adminFormVisible: boolean;
  addAdminLoading: boolean;
  deleteAdminLoading: boolean;
  rsmList?: any[];
  selectedAuthority: string;
}

interface CreateFormProps extends FormComponentProps {
  visible: boolean;
  handleAdd: (fieldsValue: { desc: string }) => void;
  onCancel: () => void;
  dataInfo?: any;
  rsmList?: any[];
  selectedAuthority: string;
  authorityList?: any[];
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

const CreateForm = Form.create<CreateFormProps>()(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, handleAdd, dataInfo, rsmList, onCancel, form, authorityList } = this
        .props as CreateFormProps;
      const { getFieldDecorator } = form;
      let authorityValue: number[] = [];
      if (dataInfo) {
        dataInfo.authority.forEach((data: GroupAuthority) => {
          authorityValue.push(data.enum[0].id);
        });
      }
      const onCreate = () => {
        form.validateFields((err: any, fieldsValue: any) => {
          if (err) return;
          form.resetFields();
          handleAdd(fieldsValue);
        });
      };

      console.log('authorityList------' + authorityList);
      return (
        <Modal
          visible={visible}
          title={'集团信息'}
          okText="确定"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="集团名称">
              {getFieldDecorator('name', {
                initialValue: dataInfo ? dataInfo.name : '',
                rules: [{ required: true, message: '请输入集团名称！' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="渠道">
              {getFieldDecorator('channel', {
                initialValue: dataInfo ? dataInfo.channel : '',
                rules: [{ required: true, message: '请输入渠道名称！' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="RSM">
              {getFieldDecorator('rsm', {
                initialValue: dataInfo ? dataInfo.rsm.name : '',
                rules: [
                  {
                    required: true,
                    message: '请选择RSM!',
                  },
                ],
              })(
                <Select style={{ width: 150 }}>
                  {rsmList
                    ? rsmList.map((data: { id: number; name: string; mobile: number }) => {
                        return (
                          <Select.Option key={data.id} value={data.id}>
                            {data.name}
                          </Select.Option>
                        );
                      })
                    : null}
                </Select>,
              )}
            </Form.Item>

            {dataInfo ? (
              <Form layout="vertical">
                <Form.Item label="授权">
                  {getFieldDecorator('authority', {
                    initialValue: authorityValue,
                  })(
                    <Checkbox.Group style={{ width: '100%' }}>
                      {authorityList?.map(data => {
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
            ) : null}
          </Form>
        </Modal>
      );
    }
  },
);

const AddAdminFrom = Form.create({ name: 'form_in_modal' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, loading, onCancel, addAdmin, form } = this.props as any;
      const { getFieldDecorator } = form;

      const onCreate = () => {
        form.validateFields((err: any, fieldsValue: any) => {
          if (err) return;

          addAdmin(fieldsValue);
        });
      };

      const cancelhandler = () => {
        form.resetFields();
        onCancel();
      };

      return (
        <Modal
          visible={visible}
          onCancel={cancelhandler}
          footer={[
            <Button key="取消" onClick={cancelhandler}>
              取消
            </Button>,
            <Button key="确定" type="primary" loading={loading} onClick={onCreate}>
              确定
            </Button>,
          ]}
        >
          <Form layout="vertical">
            <Form.Item label="集团总控编号">
              {getFieldDecorator('id', {
                rules: [{ required: true, message: '请输入指定集团总控编号！' }],
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

class GroupList extends React.Component {
  columns = [
    {
      title: '集团编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '集团名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={() => {
            this.showDetailInfo(record.id);
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: '渠道号',
      dataIndex: 'channel',
      key: 'channel',
    },
    {
      title: 'RSM',
      dataIndex: 'rsm.name',
      key: 'rsm',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },

    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => (
        <Button type="primary" onClick={() => this.editBtnHandler(record)}>
          修改
        </Button>
      ),
    },
  ];

  state: StateData = {
    deleteAdminLoading: false,
    adminFormVisible: false,
    infoVisible: false,
    formVisible: false,
    pagination: { current: 1, total: 1 },
    dataList: [],
    addAdminLoading: false,
    authorityList: [],
    selectedAuthority: '',
  };

  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(
    localStorage.getItem('LoginInfo') as string,
  );
  private token: string = '';

  componentDidMount() {
    this.token =
      'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
    this.getDataInfoList();
    this.getRsmList();
    this.getAuthorityList();
  }

  showDetailInfo = (groupId: number) => {
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
        group_id: groupId,
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

  getDataInfoList = () => {
    if (!this.loginData) return;
    return fetch('/api/group/list', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
    })
      .then(response => response.json())
      .then(json => {
        (json.response.list as []).forEach((data: any, index: number) => {
          data.key = index;
        });
        const pagination = { ...this.state.pagination };
        pagination.total = json.response.total ? json.response.total : 1;
        this.setState({
          pagination,
          dataList: json.response.list,
        });
      });
  };

  getRsmList() {
    if (!this.loginData) return;

    return fetch('/api/enum/rsm/list', {
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
          rsmList: json.response,
        });
      });
  }

  getAuthorityList() {
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
  }

  editBtnHandler = (value: any) => {
    console.log('----clickEdit: ', value);

    this.setState({
      formVisible: true,
      dataInfo: value,
    });
  };

  handleTableChange = (pagination: any) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState(
      {
        pagination: pager,
      },
      () => {
        this.getDataInfoList();
      },
    );
  };

  searchGroupList = (authority: number) => {
    if (!this.loginData) return;
    return fetch('/api/group/search', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        authority: authority,
      }),
    })
      .then(response => response.json())
      .then(json => {
        (json.response.list as []).forEach((data: any, index: number) => {
          data.key = index;
        });
        const pagination = { ...this.state.pagination };
        pagination.total = json.response.total ? json.response.total : 1;
        this.setState({
          pagination,
          dataList: json.response.list,
        });
      });
  };

  handleFormReset = () => {
    //重置SELECT
    this.setState({
      selectedAuthority: '',
    });
    this.getDataInfoList();
  };

  handleAuthorityChange = (value: any) => {
    console.log(value);
    this.setState({
      selectedAuthority: value,
    });
    this.searchGroupList(value);
  };

  renderSimpleForm() {
    return (
      <Form layout="inline">
        <Row gutter={{ md: 4, lg: 12, xl: 24 }}>
          <Col md={4} sm={12}>
            <Select
              style={{ width: '100%' }}
              onChange={this.handleAuthorityChange}
              value={this.state.selectedAuthority}
            >
              {this.state.authorityList
                ? this.state.authorityList.map((data: { id: number; name: string }) => {
                    return (
                      <Select.Option key={data.id} value={data.id}>
                        {data.name}
                      </Select.Option>
                    );
                  })
                : null}
            </Select>
          </Col>
          <Col md={4} sm={12}>
            <span className={styles.submitButtons}>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  handleCancel = () => {
    this.setState({ formVisible: false });
  };

  handleAdd = (values: any) => {
    console.log('Received values of form: ', values);

    if (this.state.dataInfo) {
      let authorityList: number[] = [];
      let valueList: number[] = values.authority;
      if (this.state.dataInfo) {
        const { dataInfo } = this.state;
        dataInfo.authority.forEach((data: GroupAuthority) => {
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
      this.editData(values);
    } else {
      this.createData(values);
    }

    this.setState({ formVisible: false });
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
        group_id: this.state.dataInfo ? this.state.dataInfo.id : '',
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) this.getDataInfoList();
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
        group_id: this.state.dataInfo ? this.state.dataInfo.id : '',
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) this.getDataInfoList();
      });
  };

  createData = (values: any) => {
    if (!this.loginData) return;
    return fetch('/api/group/create', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        name: values.name,
        channel: values.channel,
        rsm: values.rsm,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.getDataInfoList();
        }
      });
  };

  editData = (values: any) => {
    console.log(values);
    if (!this.loginData) return;
    return fetch('/api/group/update', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        group_id: this.state.dataInfo.id,
        channel: values.channel,
        name: values.name,
        rsm: values.rsm,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.getDataInfoList();
        }
      });
  };

  handleFormVisible = (flag?: boolean) => {
    this.setState({
      formVisible: !!flag,
      dataInfo: null,
    });
  };

  addAdmin = (value: any) => {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;

    this.setState({
      addAdminLoading: true,
    });

    return fetch('/api/group/admin/append', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: loginInfo.id,
        group_id: this.state.detailInfo.id,
        group_admin_id: value.id,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.setState({
            adminFormVisible: false,
            addAdminLoading: false,
          });

          this.showDetailInfo(this.state.detailInfo.id);
        } else {
          message.error('添加总控失败');
          this.setState({
            addAdminLoading: false,
          });
        }
      });
  };

  deleteAdmin = (adminId: number) => {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;

    this.setState({
      deleteAdminLoading: true,
    });

    return fetch('/api/group/admin/remove', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: loginInfo.id,
        group_id: this.state.detailInfo.id,
        group_admin_id: adminId,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.setState({
            deleteAdminLoading: false,
          });

          this.showDetailInfo(this.state.detailInfo.id);
        } else {
          message.error('删除总控失败！');
          this.setState({
            deleteAdminLoading: false,
          });
        }
      });
  };

  showAddAdmin = () => {
    this.setState({
      adminFormVisible: true,
    });
  };

  hideAddAdmin = () => {
    this.setState({
      adminFormVisible: false,
    });
  };

  render() {
    if (!this.state.dataList.length) {
      return <PageLoading />;
    }

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleFormVisible(true)}>
                添加集团
              </Button>
            </div>
            <Table
              columns={this.columns}
              bordered
              dataSource={this.state.dataList}
              pagination={this.state.pagination}
              onChange={this.handleTableChange}
            />
          </div>

          <CreateForm
            visible={this.state.formVisible}
            onCancel={this.handleCancel}
            handleAdd={this.handleAdd}
            dataInfo={this.state.dataInfo}
            rsmList={this.state.rsmList}
            authorityList={this.state.authorityList}
            selectedAuthority={this.state.selectedAuthority}
          />

          <GroupDetailInfo
            visible={this.state.infoVisible}
            onCancel={this.hideDetailInfo}
            detailInfo={this.state.detailInfo}
            onAddAdmin={this.showAddAdmin}
            deleteAdmin={this.deleteAdmin}
            deleteAdminLoading={this.state.deleteAdminLoading}
          />

          <AddAdminFrom
            visible={this.state.adminFormVisible}
            loading={this.state.addAdminLoading}
            onCancel={this.hideAddAdmin}
            addAdmin={this.addAdmin}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default GroupList;
