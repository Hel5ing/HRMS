import React from 'react';
import { Table, Button, Card, Form, Checkbox, Input, Modal } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { LoginInfo } from '@/models/login';
import { FormComponentProps } from 'antd/lib/form';
import styles from '../style.less';

export interface RoleInfo {
  key: number;
  id: number;
  name: string;
  role_function: any[];
}

interface RoleState {
  formVisible: boolean;
  pagination: { current: number; total: number };
  roleInfoList: RoleInfo[];
  authorityList?: any[];
  showType: number;
  roleInfo?: RoleInfo;
}

interface CreateFormProps extends FormComponentProps {
  visible: boolean;
  handleAdd: (fieldsValue: { desc: string }) => void;
  onCancel: () => void;
  showType?: number;
  authorityList?: any[];
  roleInfo?: RoleInfo;
}

const CreateForm = Form.create<CreateFormProps>()(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, handleAdd, roleInfo, showType, onCancel, authorityList, form } = this
        .props as any;
      const { getFieldDecorator } = form;

      const onCreate = () => {
        form.validateFields((err: any, fieldsValue: any) => {
          if (err) return;
          form.resetFields();
          handleAdd(fieldsValue);
        });
      };

      let authorityValue: number[] = [];
      if (roleInfo && roleInfo.role_function) {
        roleInfo.role_function.forEach((data: any) => {
          authorityValue.push(data.func.id);
        });
      }
      console.log('------authorityValue: ', authorityValue);

      const view =
        showType === 0 ? (
          <Form layout="vertical">
            <Form.Item label="角色名称">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入角色名称！' }],
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
                      <Checkbox style={{ marginBottom: 20 }} key={data.id} value={data.id}>
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
          title={showType === 0 ? '创建角色' : '修改授权信息'}
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

class RoleInfoList extends React.Component {
  columns = [
    {
      title: '角色编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '功能权限',
      dataIndex: 'role_function',
      key: 'role_function',
      render: (roleFunList: any[]) => {
        let str: string = '';

        roleFunList.forEach((data: any) => {
          str += data.func.name + ' | ';
        });
        return <div>{str}</div>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => (
        <Button type="primary" onClick={() => this.editBtnHandler(record)}>
          编辑权限
        </Button>
      ),
    },
  ];

  state: RoleState = {
    showType: -1,
    formVisible: false,
    pagination: { current: 1, total: 1 },
    roleInfoList: [],
  };

  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(localStorage.getItem(
    'LoginInfo',
  ) as string);
  private token: string = '';

  componentDidMount() {
    this.token =
      'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
    this.getRoleInfoList();
    this.getAuthorityList();
  }

  getRoleInfoList = () => {
    if (!this.loginData) return;
    return fetch('/api/role/flatlist', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
    })
      .then(response => response.json())
      .then(json => {
        (json.response as []).forEach((data: any, index: number) => {
          data.key = index;
        });
        const pagination = { ...this.state.pagination };
        pagination.total = json.response.total ? json.response.total : 1;
        this.setState({
          pagination,
          roleInfoList: json.response,
        });
      });
  };

  getAuthorityList() {
    if (!this.loginData) return;
    return fetch('/api/enum/function/list', {
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

  editBtnHandler = (value: RoleInfo) => {
    console.log('----clickEdit: ', value);
    this.setState({
      formVisible: true,
      showType: 1,
      roleInfo: value,
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
        this.getRoleInfoList();
      },
    );
  };

  handleCancel = () => {
    this.setState({ formVisible: false });
  };

  handleAdd = (values: any) => {
    console.log('Received values of form: ', values);
    if (this.state.showType === 0) {
      this.createRole(values.name);
    } else {
      let authorityList: number[] = [];
      let valueList: number[] = values.authority;

      if (this.state.roleInfo) {
        const { roleInfo } = this.state;
        roleInfo.role_function.forEach((data: any) => {
          authorityList.push(data.func.id);
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

    this.setState({ formVisible: false });
  };

  addAuthority = (authority_id: number) => {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;

    return fetch('/api/role/function/append', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: loginInfo.id,
        function_id: authority_id,
        role_id: this.state.roleInfo ? this.state.roleInfo.id : '',
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) this.getRoleInfoList();
      });
  };

  deleteAuthority = (authority_id: number) => {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;

    return fetch('/api/role/function/remove', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: loginInfo.id,
        function_id: authority_id,
        role_id: this.state.roleInfo ? this.state.roleInfo.id : '',
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) this.getRoleInfoList();
      });
  };

  createRole = (params: string) => {
    if (!this.loginData) return;
    return fetch('/api/role/create', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        name: params,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.getRoleInfoList();
        }
      });
  };

  handleFormVisible = (flag?: boolean) => {
    this.setState({
      formVisible: !!flag,
      showType: 0,
    });
  };

  render() {
    if (!this.state.roleInfoList.length) {
      return <PageLoading />;
    }

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleFormVisible(true)}>
                新建
              </Button>
            </div>
            <Table
              columns={this.columns}
              bordered
              dataSource={this.state.roleInfoList}
              // pagination={this.state.pagination}
              onChange={this.handleTableChange}
            />
          </div>

          <CreateForm
            visible={this.state.formVisible}
            onCancel={this.handleCancel}
            handleAdd={this.handleAdd}
            authorityList={this.state.authorityList ? this.state.authorityList : []}
            showType={this.state.showType}
            roleInfo={this.state.roleInfo}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default RoleInfoList;
