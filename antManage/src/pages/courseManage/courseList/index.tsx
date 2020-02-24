import React from 'react';
import { Table, Button, Modal, Divider, Tag, Form, Input, TreeSelect, Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { LoginInfo } from '@/models/login';
import { FormComponentProps } from 'antd/lib/form';
import styles from '../style.less';
import DetailInfo from './components/DetailInfo';
import ProductSelectView from './components/ProductSelectView';

interface StateData {
  formVisible: boolean;
  pagination: { current: number; total: number };
  dataList: any[];
  authorityList?: any[];
  dataInfo?: any;
  categoryList?: any[];
  infoVisible: boolean;
  detailInfo?: any;
  selectValue: {
    productLine: any;
    productType: any;
    product: string[];
  };
}

interface CreateFormProps extends FormComponentProps {
  visible: boolean;
  handleAdd: (fieldsValue: { desc: string }) => void;
  onCancel: () => void;
  dataInfo?: any;
  categoryList?: any[];
  selectValue: {
    productLine: any;
    productType: any;
    product: string[];
  };
  onChange: (value: { productLine: any; productType: any; product: string[] }) => void;
}

const CreateForm = Form.create<CreateFormProps>()(
  class extends React.Component {
    render() {
      const {
        visible,
        handleAdd,
        dataInfo,
        selectValue,
        onChange,
        categoryList,
        onCancel,
        form,
      } = this.props as CreateFormProps;
      const { getFieldDecorator } = form;

      const onCreate = () => {
        form.validateFields((err: any, fieldsValue: any) => {
          if (err) return;
          form.resetFields();
          handleAdd(fieldsValue);
        });
      };

      const validatorForm = (
        _: any,
        value: {
          productLine: any;
          productType: any;
          product: string[];
        },
        callback: (message?: string) => void,
      ) => {
        if (dataInfo) return;
        const { product } = value;
        if (!product || product.length <= 0) {
          callback('请选择课程产品！!');
        }

        callback();
      };

      return (
        <Modal
          visible={visible}
          title={dataInfo ? '修改信息' : '创建信息'}
          okText="确定"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="课程标题">
              {getFieldDecorator('title', {
                initialValue: dataInfo ? dataInfo.title : '',
                rules: [{ required: true, message: '请输入课程标题！' }],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="课程内容">
              {getFieldDecorator('content', {
                initialValue: dataInfo ? dataInfo.content : '',
                rules: [{ required: true, message: '请输入课程内容！' }],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="课程产品">
              {getFieldDecorator('products', {
                initialValue: selectValue,
                rules: [
                  { required: dataInfo ? false : true, message: '请选择课程产品！' },
                  {
                    validator: validatorForm,
                  },
                ],
              })(<ProductSelectView selectValue={selectValue} onChange={onChange} />)}
            </Form.Item>

            <Form.Item label="课程类别">
              {getFieldDecorator('category', {
                initialValue: dataInfo && dataInfo.category ? dataInfo.category.id : '',
                rules: [{ required: true, message: '请选择课程类别！' }],
              })(
                <TreeSelect
                  style={{ width: '100%' }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  treeData={categoryList}
                  placeholder="Please select"
                />,
              )}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

class CourseList extends React.Component<FormComponentProps> {
  columns = [
    {
      title: '课程编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '课程标题',
      dataIndex: 'title',
      key: 'title',
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
      title: '课程类别',
      dataIndex: 'category.name',
      key: 'category',
    },
    {
      title: '课程内容',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (data: any) => <Tag color="blue">{data.name}</Tag>,
    },
    {
      title: '创建人',
      dataIndex: 'created_by',
      key: 'created_by',
      render: (data: any) => <div>{data.name}</div>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '课程产品组',
      dataIndex: 'products',
      key: 'products',
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
          <Button type="primary" onClick={() => this.deleteBtnHandler(record)}>
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
    infoVisible: false,
    selectValue: {
      productLine: { label: '', key: '' },
      productType: { label: '', key: '' },
      product: [],
    },
  };

  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(
    localStorage.getItem('LoginInfo') as string,
  );
  private token: string = '';

  componentDidMount() {
    this.token =
      'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
    this.getDataInfoList();
    this.getDataTypeList();
  }

  getDataInfoList = () => {
    if (!this.loginData) return;
    return fetch('/api/course/list', {
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

  getDataTypeList = () => {
    if (!this.loginData) return;
    return fetch('/api/course/category/list', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        limit: 999,
        offset: 0,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          let list: any[] = [];
          (json.response as []).forEach((data: any) => {
            let item: any = {};
            item.title = data.name;
            item.value = data.id;
            item.key = data.id;

            if (data.children && data.children.length) {
              item.children = [];
              data.children.forEach((childData: any) => {
                let childItem: any = {};
                childItem.title = childData.name;
                childItem.value = childData.id;
                childItem.key = childData.id;
                item.children.push(childItem);
              });
            }
            list.push(item);
          });
          this.setState({
            categoryList: list,
          });
        } else {
        }
      });
  };

  showDetailInfo = (dataId: number) => {
    if (!this.loginData) return;

    this.setState({
      infoVisible: true,
      detailInfo: null,
    });

    return fetch('/api/course/detail', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        course_id: dataId,
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

  editBtnHandler = (value: any) => {
    this.setState({
      formVisible: true,
      dataInfo: value,
      selectValue: {
        productLine: { label: '', key: '' },
        productType: { label: '', key: '' },
        product: [],
      },
    });
  };

  deleteBtnHandler = (value: any) => {
    if (!this.loginData) return;
    return fetch('/api/course/delete', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        course_id: value.id,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.getDataInfoList();
        }
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
    return fetch('/api/course/create', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        title: values.title,
        content: values.content,
        category: values.category,
        products: values.products.product.join(','),
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
    return fetch('/api/course/update', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        course_id: this.state.dataInfo.id,
        admin_id: this.loginData.loginInfo.id,
        title: values.title,
        content: values.content,
        category: values.category,
        products: values.products.product.join(','),
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
      selectValue: {
        productLine: { label: '', key: '' },
        productType: { label: '', key: '' },
        product: [],
      },
    });
  };

  onChange = (value: { productLine: any; productType: any; product: string[] }) => {
    this.setState({
      selectValue: {
        productLine: value.productLine,
        productType: value.productType,
        product: value.product,
      },
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
              pagination={this.state.pagination}
              onChange={this.handleTableChange}
            />
          </div>

          <CreateForm
            visible={this.state.formVisible}
            onCancel={this.handleCancel}
            handleAdd={this.handleAdd}
            dataInfo={this.state.dataInfo}
            categoryList={this.state.categoryList}
            selectValue={this.state.selectValue}
            onChange={this.onChange}
          />

          <DetailInfo
            visible={this.state.infoVisible}
            onCancel={this.hideDetailInfo}
            detailInfo={this.state.detailInfo}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default Form.create<FormComponentProps>()(CourseList);
