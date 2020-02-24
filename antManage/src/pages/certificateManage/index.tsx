import React from 'react';
import {
  Table,
  Button,
  Col,
  message,
  Tag,
  Form,
  Input,
  Row,
  Select,
  Card,
  Upload,
  Icon,
} from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { LoginInfo } from '@/models/login';
import { FormComponentProps } from 'antd/lib/form';
import styles from '../style.less';
import DetailInfo from './components/DetailInfo';

interface StateData {
  pagination: { current: number; total: number };
  dataList: any[];
  infoVisible: boolean;
  detailInfo?: any;
}

const FormItem = Form.Item;
const { Option } = Select;

class CertificateList extends React.Component<FormComponentProps> {
  columns = [
    {
      title: '员工号',
      dataIndex: 'course_authority',
      key: 'employee_id',
      render: (data: any) => <div>{data.engineer.employee_id}</div>,
    },
    {
      title: '员工姓名',
      dataIndex: 'course_authority',
      key: 'engineerName',
      render: (data: any) => <div>{data.engineer.name}</div>,
    },
    {
      title: '所属集团',
      dataIndex: 'course_authority',
      key: 'group',
      render: (data: any) => <div>{data.engineer.site ? data.engineer.site.group.name : ''}</div>,
    },
    {
      title: '站点代码',
      dataIndex: 'course_authority',
      key: 'code',
      render: (data: any) => <div>{data.engineer.site ? data.engineer.site.code : ''}</div>,
    },
    {
      title: '授权主课程',
      dataIndex: 'course_authority',
      key: 'course',
      render: (data: any) => <div>{data.course.title}</div>,
    },
    {
      title: '证书状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) =>
        status === 1 ? <Tag color="blue">有效</Tag> : <Tag color="red">无效</Tag>,
    },
    {
      title: '证书有效期',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => (
        <div>
          <Button type="primary" onClick={() => this.showDetailInfo(record.id)}>
            查看
          </Button>
        </div>
      ),
    },
  ];

  state: StateData = {
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
  }

  getDataInfoList = () => {
    if (!this.loginData) return;
    return fetch('/api/certificate/list', {
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

  showDetailInfo = (dataId: number) => {
    if (!this.loginData) return;

    this.setState({
      infoVisible: true,
      detailInfo: null,
    });

    return fetch('/api/certificate/detail', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        certificate_id: dataId,
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
    return fetch('/api/certificate/query', {
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
                <Select placeholder="请选择" style={{ width: 200 }}>
                  <Option value="1">按员工工号查询</Option>
                  <Option value="2">按员工姓名模糊查询</Option>
                  <Option value="3">按课程名称模糊查询</Option>
                  <Option value="4">按站点代码模糊查询</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem>
              {getFieldDecorator('condition_value', {
                rules: [{ required: true, message: '请输入查询内容' }],
              })(<Input style={{ width: 320 }} placeholder="请输入" />)}
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

    const getDataList = () => {
      this.getDataInfoList();
    };

    const props = {
      accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      name: 'excel',
      action: '/api/certificate/review/import',
      headers: {
        Authorization: this.token,
      },
      onChange(info: any) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} 上传成功`);
          getDataList();
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} 上传失败`);
        }
      },
    };

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div style={{ marginTop: 20, marginBottom: 20 }} className={styles.tableListOperator}>
              <Upload {...props}>
                <Button>
                  <Icon type="upload" /> 导入证书年检记录
                </Button>
              </Upload>
            </div>
            <Table
              columns={this.columns}
              bordered
              dataSource={this.state.dataList}
              pagination={this.state.pagination}
              onChange={this.handleTableChange}
            />
          </div>

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
export default Form.create<FormComponentProps>()(CertificateList);
