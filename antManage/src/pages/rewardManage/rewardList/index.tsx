import React from 'react';
import {
  Table,
  Button,
  Col,
  message,
  Modal,
  Divider,
  Form,
  Input,
  TreeSelect,
  Row,
  Select,
  Card,
} from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { LoginInfo } from '@/models/login';
import { FormComponentProps } from 'antd/lib/form';
import styles from '../style.less';
import DetailInfo from './components/DetailInfo';
import ExportJsonExcel from 'js-export-excel';

interface StateData {
  formVisible: boolean;
  pagination: { current: number; total: number };
  dataList: any[];
  authorityList?: any[];
  dataInfo?: any;
  categoryList?: any[];
  infoVisible: boolean;
  detailInfo?: any;
  searchList: any[];
}

interface CreateFormProps extends FormComponentProps {
  visible: boolean;
  handleAdd: (fieldsValue: { desc: string }) => void;
  onCancel: () => void;
  dataInfo?: any;
  categoryList?: any[];
  searchList: any[];
  searchPerson: (type: number, value: string) => void;
}

const FormItem = Form.Item;
const { Option } = Select;

const CreateForm = Form.create<CreateFormProps>()(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const {
        visible,
        handleAdd,
        dataInfo,
        searchPerson,
        searchList,
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

      console.log('------searchList: ', searchList);

      const onSearch = (value: string) => {
        searchPerson(1, value);
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
            <Form.Item label="被奖惩人员姓名（支持模糊查找）">
              {getFieldDecorator('target_id', {
                initialValue: dataInfo ? dataInfo.target.id : '',
                rules: [{ required: true, message: '请输入被奖惩人员姓名！' }],
              })(
                <Select
                  showSearch
                  style={{ width: 400 }}
                  placeholder="Select a person"
                  optionFilterProp="children"
                  onSearch={onSearch}
                  filterOption={(input, option: any) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {searchList.map((data: any) => {
                    return (
                      <Option key={data.id} value={data.id}>
                        {data.name + '-' + data.mobile}
                      </Option>
                    );
                  })}
                </Select>,
              )}
            </Form.Item>

            <Form.Item label="备注">
              {getFieldDecorator('remark', {
                initialValue: dataInfo ? dataInfo.remark : '',
                rules: [{ required: true, message: '请输入备注内容！' }],
              })(<Input />)}
            </Form.Item>

            {dataInfo ? null : (
              <Form.Item label="奖惩类型">
                {getFieldDecorator('category', {
                  initialValue: dataInfo ? dataInfo.category : '',
                  rules: [{ required: true, message: '请选择奖惩类型！' }],
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

class RewardList extends React.Component<FormComponentProps> {
  columns = [
    {
      title: '记录编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '奖惩分类信息',
      dataIndex: 'category',
      key: 'category',
      render: (data: any, record: any) => (
        <div
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={() => {
            this.showDetailInfo(record.id);
          }}
        >
          {data ? data.name : ''}
        </div>
      ),
    },
    {
      title: '被奖惩人',
      dataIndex: 'target',
      key: 'target',
      render: (data: any) => <div>{data.name}</div>,
    },
    {
      title: '员工工号',
      dataIndex: 'target.employee_id',
      key: 'employee_id',
    },
    {
      title: '奖惩发起人',
      dataIndex: 'published_by',
      key: 'published_by',
      render: (data: any) => <div>{data.name}</div>,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
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
        </div>
      ),
    },
  ];

  state: StateData = {
    formVisible: false,
    pagination: { current: 1, total: 1 },
    dataList: [],
    infoVisible: false,
    searchList: [],
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
    return fetch('/api/rap/list', {
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
    return fetch('/api/rap/category/list', {
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

    return fetch('/api/rap/detail', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        rap_id: dataId,
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
    return fetch('/api/rap/delete', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        rap_id: value.id,
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
    this.setState({
      searchList: [],
      formVisible: false,
    });
  };

  handleAdd = (values: any) => {
    if (this.state.dataInfo) {
      this.editData(values);
    } else {
      this.createData(values);
    }

    this.setState({ searchList: [], formVisible: false });
  };

  createData = (values: any) => {
    if (!this.loginData) return;
    return fetch('/api/rap/create', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        target_id: values.target_id,
        remark: values.remark,
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
    return fetch('/api/rap/update', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        rap_id: this.state.dataInfo.id,
        target_id: values.target_id,
        remark: values.remark,
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
    return fetch('/api/rap/query', {
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
                  <Option value="1">根据奖惩分类查询</Option>
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

  searchPerson = (type: number, value: string) => {
    if (!value) {
      this.setState({
        searchList: [],
      });
      return;
    }

    if (!this.loginData) return;
    let { loginInfo } = this.loginData;
    return fetch('/api/person/list/querybygroup', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        group_id: loginInfo.group_id,
        condition_id: type,
        condition_value: value,
        limit: 9999,
        offset: 0,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.setState({
            searchList: json.response.list,
          });
        } else {
        }
      });
  };

  downloadFileToExcel = () => {
    let rapList = this.state.dataList; //从props中获取数据源
    let option = {}; //option代表的就是excel文件
    let dataTable = []; //excel文件中的数据内容
    if (rapList && rapList.length > 0) {
      for (let i in rapList) {
        //循环获取excel中每一行的数据
        //let _planDay = formatTime(siteList[i].planDay, true);  //格式化日期（自定义方法）
        let obj = {
          奖惩分类: rapList[i].category.name,
          被奖惩人: rapList[i].target.name,
          员工编号: rapList[i].target.employee_id,
          奖惩发起人: rapList[i].published_by.name,
          备注: rapList[i].remark,
          创建时间: rapList[i].created_at,
        };
        dataTable.push(obj); //设置excel中每列所获取的数据源
      }
    }
    option.fileName = '奖惩列表'; //excel文件名称
    option.datas = [
      {
        sheetData: dataTable, //excel文件中的数据源
        sheetName: 'sheet1', //excel文件中sheet页名称
        sheetFilter: ['奖惩分类', '被奖惩人', '员工编号', '奖惩发起人', '备注', '创建时间'], //excel文件中需显示的列数据
        sheetHeader: ['奖惩分类', '被奖惩人', '员工编号', '奖惩发起人', '备注', '创建时间'], //excel文件中每列的表头名称
      },
    ];
    let toExcel = new ExportJsonExcel(option); //生成excel文件
    toExcel.saveExcel(); //下载excel文件
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
                创建
              </Button>
              <Button
                type="primary"
                icon="download"
                onClick={this.downloadFileToExcel}
                style={{ marginBottom: 10, marginTop: 10, marginLeft: 10 }}
              >
                下载
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
            searchList={this.state.searchList}
            searchPerson={this.searchPerson}
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
export default Form.create<FormComponentProps>()(RewardList);
