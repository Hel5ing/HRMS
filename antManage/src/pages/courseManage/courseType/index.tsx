import React from 'react';
import { Table, Button, Card, Form, Input, Modal, Divider, message } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { LoginInfo } from '@/models/login';
import { FormComponentProps } from 'antd/lib/form';
import styles from '../style.less';

interface StateData {
  formVisible: boolean;
  pagination: { current: number; total: number };
  dataList: any[];
  authorityList?: any[];
  dataInfo?: any;
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
          title={'课程类别信息'}
          okText="确定"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="课程类别名称">
              {getFieldDecorator('name', {
                initialValue: dataInfo ? dataInfo.name : '',
                rules: [{ required: true, message: '请输入课程类别名称！' }],
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

class CourseTypeView extends React.Component {
  columns = [
    {
      title: '课程类别编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '课程类别名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => (
        <div>
          <Button type="primary" onClick={() => this.editBtnHandler(record)}>
            修改
          </Button>
          <Divider type="vertical" />
          <Button type="danger" onClick={() => this.deleteBtnHandler(record)}>
            删除
          </Button>
        </div>
      ),
    },
  ];

  state: StateData = {
    formVisible: false,
    pagination: { current: 1, total: 1 },
    dataList: [],
  };

  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(
    localStorage.getItem('LoginInfo') as string,
  );
  private token: string = '';

  componentDidMount() {
    this.token =
      'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
    this.getDataInfoList();
  }

  getDataInfoList = () => {
    if (!this.loginData) return;
    return fetch('/api/course/category/list', {
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
          dataList: json.response,
        });
      });
  };

  deleteBtnHandler = (value: any) => {
    return fetch('/api/course/category/delete', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        category_id: value.id,
      }),
    })
      .then(response => response.json())
      .then(json => {
        this.setState({ formVisible: false });
        if (json.success) {
          this.getDataInfoList();
        } else {
          message.error('操作失败,请稍后再试');
        }
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
    console.log('handleAdd values: ', values);

    if (this.state.dataInfo) {
      this.editData(values);
    } else {
      this.createData(values);
    }

    this.setState({ formVisible: false });
  };

  createData = (values: any) => {
    if (!this.loginData) return;
    return fetch('/api/course/category/create', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
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

  editData = (values: any) => {
    if (!this.loginData) return;
    return fetch('/api/course/category/update', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        category_id: this.state.dataInfo.id,
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
                创建
              </Button>
            </div>
            <Table
              columns={this.columns}
              bordered
              dataSource={this.state.dataList}
              // pagination={this.state.pagination}
              onChange={this.handleTableChange}
            />
          </div>

          <CreateForm
            visible={this.state.formVisible}
            onCancel={this.handleCancel}
            handleAdd={this.handleAdd}
            dataInfo={this.state.dataInfo}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CourseTypeView;
