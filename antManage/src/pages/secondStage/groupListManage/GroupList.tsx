import React from 'react';
import { Table, Button, Card, Form, Input, Modal, message } from 'antd';
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
}

interface CreateFormProps extends FormComponentProps {
  visible: boolean;
  handleAdd: (fieldsValue: { desc: string }) => void;
  onCancel: () => void;
  dataInfo?: any;
}

const CreateForm = Form.create<CreateFormProps>()(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, handleAdd, dataInfo, onCancel, form } = this.props as CreateFormProps;
      const { getFieldDecorator } = form;

      const onCreate = () => {
        form.validateFields((err: any, fieldsValue: any) => {
          if (err) return;
          form.resetFields();
          handleAdd(fieldsValue);
        });
      };

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
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },

    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => (
        <Button type="primary" onClick={() => this.editBtnHandler(record)}>
          修改集团信息
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
  };

  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(localStorage.getItem(
    'LoginInfo',
  ) as string);
  private token: string = '';

  componentDidMount() {
    this.token =
      'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
    this.getDataInfoList();
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

  handleCancel = () => {
    this.setState({ formVisible: false });
  };

  handleAdd = (values: any) => {
    console.log('Received values of form: ', values);

    if (this.state.dataInfo) {
      this.editData(values);
    } else {
      this.createData(values);
    }

    this.setState({ formVisible: false });
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
