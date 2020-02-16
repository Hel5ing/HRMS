import React from 'react';
import { Table, Button, Col, message, Modal, Form, Input, Row, Select, Card } from 'antd';
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

const FormItem = Form.Item;
const { Option } = Select;

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
          title={'产品信息'}
          okText="确定"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="产品名称">
              {getFieldDecorator('name', {
                initialValue: dataInfo ? dataInfo.name : '',
                rules: [{ required: true, message: '请输入产品名称！' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="产品号">
              {getFieldDecorator('number', {
                initialValue: dataInfo ? dataInfo.number : '',
                rules: [{ required: true, message: '请输入产品号！' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="产品类型编号">
              {getFieldDecorator('product_category_id', {
                initialValue: dataInfo ? dataInfo.product_category_id : '',
                rules: [{ required: true, message: '请输入产品类型编号！' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="产品线编号">
              {getFieldDecorator('product_line_id', {
                initialValue: dataInfo ? dataInfo.product_line_id : '',
                rules: [{ required: true, message: '请输入产品线编号！' }],
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

class ProductList extends React.Component<FormComponentProps> {
  columns = [
    {
      title: '产品编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '产品号',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '产品类型',
      dataIndex: 'product_category',
      key: 'product_category',
      render: (data: any) => <div>{data.name}</div>,
    },
    {
      title: '产品线',
      dataIndex: 'product_line',
      key: 'product_line',
      render: (data: any) => <div>{data.name}</div>,
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
          修改产品信息
        </Button>
      ),
    },
  ];

  state: StateData = {
    formVisible: false,
    pagination: { current: 1, total: 1 },
    dataList: [],
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

  getDataInfoList = () => {
    if (!this.loginData) return;
    return fetch('/api/product/list', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        limit: 10,
        offset: (this.state.pagination.current - 1) * 10,
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
    return fetch('/api/product/create', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        name: values.name,
        product_line_id: values.product_line_id,
        number: values.number,
        product_category_id: values.product_category_id,
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
    return fetch('/api/product/update', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        product_id: this.state.dataInfo.id,
        name: values.name,
        product_line_id: values.product_line_id,
        number: values.number,
        product_category_id: values.product_category_id,
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

  handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const { form } = this.props;

    form.validateFields((err: any, fieldsValue: any) => {
      if (err) return;

      this.searchInfo(fieldsValue);
    });
  };

  searchInfo = (values: any) => {
    if (!this.loginData) return;
    return fetch('/api/product/query', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        condition_id: values.condition_id,
        condition_value: values.condition_value,
        limit: 9999,
        offset: 0,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          (json.response.list as []).forEach((data: any, index: number) => {
            data.key = index;
          });
          const pagination = { ...this.state.pagination };
          pagination.total = json.response.total ? json.response.total : 1;
          this.setState({
            pagination,
            dataList: json.response.list,
          });
        } else {
          message.error('没有查到类似信息！');
        }
      });
  };

  renderSimpleForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="筛选条件">
              {getFieldDecorator('condition_id', {
                initialValue: '1',
                rules: [{ required: true, message: '请选择查询条件' }],
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="1">根据产品名查询</Option>
                  <Option value="2">根据产品号查询</Option>
                  <Option value="3">根据产品类型编号查询</Option>
                  <Option value="4">根据产品线编号查询</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem>
              {getFieldDecorator('condition_value', {
                rules: [{ required: true, message: '请输入查询内容' }],
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.getDataInfoList}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

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
                添加产品
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
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default Form.create<FormComponentProps>()(ProductList);
