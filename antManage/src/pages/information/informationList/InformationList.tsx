import React from 'react';
import {
  Table,
  Button,
  Col,
  message,
  Modal,
  Divider,
  Tag,
  Form,
  Input,
  Row,
  TreeSelect,
  Select,
  Card,
} from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { LoginInfo } from '@/models/login';
import { FormComponentProps } from 'antd/lib/form';
import styles from '../style.less';
import DetailInfo from './components/DetailInfo';

interface StateData {
  formVisible: boolean;
  pagination: { current: number; total: number };
  dataList: any[];
  authorityList?: any[];
  dataInfo?: any;
  categoryList?: any[];
  infoVisible: boolean;
  detailInfo?: any;
}

interface CreateFormProps extends FormComponentProps {
  visible: boolean;
  handleAdd: (fieldsValue: { desc: string }) => void;
  onCancel: () => void;
  dataInfo?: any;
  categoryList?: any[];
}

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;


const CreateForm = Form.create<CreateFormProps>()(
  class extends React.Component {
    render() {
      const { visible, handleAdd, dataInfo, categoryList, onCancel, form } = this
        .props as CreateFormProps;
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
          title={dataInfo ? '修改信息' : '创建信息'}
          okText="确定"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="信息标题">
              {getFieldDecorator('title', {
                initialValue: dataInfo ? dataInfo.title : '',
                rules: [{ required: true, message: '请输入信息标题！' }],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="信息内容">
              {getFieldDecorator('content', {
                initialValue: dataInfo ? dataInfo.content : '',
                rules: [{ required: true, message: '请输入信息内容！' }],
              })(<TextArea rows={3} />)}
            </Form.Item>

            {dataInfo ? null : (
              <Form.Item label="信息类别">
                {getFieldDecorator('category', {
                  initialValue: dataInfo ? dataInfo.category : '',
                  rules: [{ required: true, message: '请选择信息类别！' }],
                })(
                  <TreeSelect
                    style={{ width: '100%' }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={categoryList}
                    placeholder="Please select"
                  />,
                )}
              </Form.Item>
            )}
          </Form>
        </Modal>
      );
    }
  },
);

class InformationList extends React.Component<FormComponentProps> {
  columns = [
    {
      title: '信息编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '信息标题',
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
      title: '类别名称',
      dataIndex: 'category',
      key: 'category',
      render: (data: any) => <div>{data.name}</div>,
    },
    {
      title: '信息内容',
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
          <Divider type="vertical" />
          {record.published_by ? null : (
            <Button type="primary" onClick={() => this.publishBtnHandler(record)}>
              发布信息
            </Button>
          )}
        </div>
      ),
    },
  ];

  state: StateData = {
    formVisible: false,
    pagination: { current: 1, total: 1 },
    dataList: [],
    infoVisible: false,
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
    return fetch('/api/information/list', {
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
    return fetch('/api/information/category/list', {
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
            item.title = data.category.name;
            item.value = data.category.id;
            item.key = data.category.id;

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

    return fetch('/api/information/detail', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        information_id: dataId,
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
    console.log('----clickEdit: ', value);

    this.setState({
      formVisible: true,
      dataInfo: value,
    });
  };

  deleteBtnHandler = (value: any) => {
    if (!this.loginData) return;
    return fetch('/api/information/delete', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        information_id: value.id,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.getDataInfoList();
        }
      });
  };

  publishBtnHandler = (value: any) => {
    if (!this.loginData) return;
    return fetch('/api/information/publish', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        information_id: value.id,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          message.success('发布成功！');
        } else {
          message.error('发布失败！');
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
    return fetch('/api/information/create', {
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
    return fetch('/api/information/update', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        information_id: this.state.dataInfo.id,
        title: values.title,
        content: values.content,
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
    return fetch('/api/information/query', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        keyword: values.condition_value,
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
                  <Option value="1">根据信息标题查询</Option>
                  <Option value="2">根据信息内容查询</Option>
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
                创建信息
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
export default Form.create<FormComponentProps>()(InformationList);
