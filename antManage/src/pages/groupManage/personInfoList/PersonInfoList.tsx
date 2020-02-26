import React from 'react';
import { Table, Button, Col, message, Modal, Form, Input, Row, Select, Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { LoginInfo } from '@/models/login';
import { SiteInfo } from '../siteInfoList/SiteInfoList';

import styles from '../style.less';
import { FormComponentProps } from 'antd/lib/form';
import CreatePersonForm from './conponents/CreatePersonForm';
import PersonInfoView from './conponents/PersonInfoView';

export interface PersonInfo {
  key: number;
  id: number;
  employee_id: number;
  name: string;
  mobile: string;
  email: string;
  identification: any;
  education: any;
  major: any;
  site_id: number;
  position: number;
  role: number;
  level: number;
  avatar: any;
  star: any;
  status: any;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  site: SiteInfo;
  college: string;
  working: string;
}

interface CourseInfo {
  id: number;
  person_id: number;
  course_id: number;
  course: object;
}

interface PersonState {
  editPerson?: PersonInfo;
  pagination: { current: number; total: number };
  personInfoList: PersonInfo[];
  personFormVisible: boolean;
  infoVisible: boolean;
  personInfo?: any;
  positionList?: { id: number; name: string; level: number }[];
  roleList?: { id: number; name: string }[];
  statusList?: any[];
  siteList?: any[];
  editData?: PersonInfo;
  certificateFormVisible: boolean;
  certificateLoading: boolean;
  certificateInfo?: any;
}

const FormItem = Form.Item;
const { Option } = Select;

const CertificateForm = Form.create({ name: 'form_in_modal' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, loading, onCancel, addCertificate, form } = this.props as any;
      const { getFieldDecorator } = form;

      const onCreate = () => {
        form.validateFields((err: any, fieldsValue: any) => {
          if (err) return;

          addCertificate(fieldsValue);
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
            <Button key="确定" onClick={cancelhandler}>
              取消
            </Button>,
            <Button key="补发证书" type="primary" loading={loading} onClick={onCreate}>
              确定
            </Button>,
          ]}
        >
          <Form layout="vertical">
            <Form.Item label="证书类型">
              {getFieldDecorator('type', {
                rules: [{ required: true, message: '请输入证书类型！' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="申请原因">
              {getFieldDecorator('reason', {
                rules: [{ required: true, message: '请输入申请原因!' }],
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

class PersonInfoList extends React.Component<FormComponentProps> {
  columns = [
    {
      title: '员工工号',
      dataIndex: 'employee_id',
      key: 'employee_id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={() => {
            this.showPersonInfo(record.id);
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (type: number) => (
        <div>{this.state.roleList ? this.state.roleList[type].name : '无'}</div>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: '所属站点',
      dataIndex: 'site',
      key: 'site',
      render: (data: SiteInfo) => <div>{data.name}</div>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '学历',
      dataIndex: 'education',
      key: 'education',
    },
    {
      title: '授权课程',
      dataIndex: 'course_authority',
      key: 'course',
      render: (courses: CourseInfo[]) => {
        let str: string = '';
        if (courses && courses.length > 0) {
          courses.forEach((data: CourseInfo) => {
            str += (data.course ? data.course.title : '') + ' ';
          });
        }

        return <div>{str}</div>;
      },
    },
    {
      title: '入职日期',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '人员状态',
      dataIndex: 'status',
      key: 'status',
      render: (data: any) => <div>{data ? data.name : ''}</div>,
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => (
        <Button type="primary" onClick={() => this.editHandler(record)}>
          编辑
        </Button>
      ),
    },
  ];

  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(
    localStorage.getItem('LoginInfo') as string,
  );
  private token: string = '';

  state: PersonState = {
    pagination: { current: 1, total: 1 },
    personInfoList: [],
    infoVisible: false,
    personFormVisible: false,
    certificateFormVisible: false,
    certificateLoading: false,
  };

  componentDidMount() {
    this.token =
      'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
    this.getPersonsList();
    this.getPostionList();
    this.getRoleList();
    this.getStatusList();
    this.getSiteList();
  }

  showPersonInfo = (personId: number) => {
    if (!this.loginData) return;
    this.setState({
      infoVisible: true,
      personInfo: null,
    });

    return fetch('/api/person/detail/byid', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        person_id: personId,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.setState({
            infoVisible: true,
            personInfo: json.response,
          });
        }
      });
  };

  editHandler = (record: PersonInfo) => {
    console.log('----clickEdit: ', record);
    this.setState({
      personFormVisible: true,
      editData: record,
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
        this.getPersonsList();
      },
    );
  };

  getPersonsList = () => {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;

    return fetch('/api/person/list/bygroup', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        group_id: loginInfo.group_id,
        limit: 10,
        offset: (this.state.pagination.current - 1) * 10,
      }),
    })
      .then(response => response.json())
      .then(json => {
        (json.response.list as []).forEach((data: PersonInfo, index: number) => {
          data.key = index;
        });
        const pagination = { ...this.state.pagination };
        pagination.total = json.response.total;
        this.setState({
          pagination,
          personInfoList: json.response.list,
        });
      });
  };

  getPostionList() {
    if (!this.loginData) return;

    return fetch('/api/enum/position/list', {
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
          positionList: json.response,
        });
      });
  }

  getRoleList() {
    if (!this.loginData) return;

    return fetch('/api/enum/role/list', {
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
          roleList: json.response,
        });
      });
  }

  getStatusList() {
    if (!this.loginData) return;
    return fetch('/api/enum/status/list', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        type: 3,
      }),
    })
      .then(response => response.json())
      .then(json => {
        this.setState({
          statusList: json.response,
        });
      });
  }

  getSiteList() {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;

    return fetch('/api/site/list/bygroup', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        group_id: loginInfo.group_id,
        limit: 99999,
        offset: 0,
      }),
    })
      .then(response => response.json())
      .then(json => {
        this.setState({
          siteList: json.response.list,
        });
      });
  }

  handleFormReset = () => {
    this.getPersonsList();
  };

  handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const { form } = this.props;

    form.validateFields((err: any, fieldsValue: any) => {
      if (err) return;

      this.searchPerson(fieldsValue.type, fieldsValue.value);
    });
  };

  searchPerson = (type: string, value: string) => {
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
          (json.response.list as []).forEach((data: any, index: number) => {
            data.key = index;
          });
          const pagination = { ...this.state.pagination };
          pagination.total = json.response.total;
          this.setState({
            pagination,
            personInfoList: json.response.list,
          });
        } else {
        }
      });
  };

  /**
   * 下拉框选择
   */
  handleChange = (value: any) => {
    console.log('--handleChange-- ', value);
  };

  handlePersonFormVisible = (flag?: boolean) => {
    this.setState({
      personFormVisible: !!flag,
      editData: null,
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
              {getFieldDecorator('type', {
                initialValue: '1',
                rules: [{ required: true, message: '请选择查询条件' }],
              })(
                <Select placeholder="请选择" style={{ width: '100%' }} onChange={this.handleChange}>
                  <Option value="1">根据姓名模糊查询</Option>
                  <Option value="2">根据手机号模糊查询</Option>
                  <Option value="3">根据员工工号模糊查询</Option>
                  <Option value="4">根据所属站点名称模糊查询</Option>
                  <Option value="5">根据员工状态筛选</Option>
                  <Option value="6">根据员工级别筛选[初级.中级.高级]</Option>
                  <Option value="7">根据员工星级筛选[1-7]</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem>
              {getFieldDecorator('value', {
                rules: [{ required: true, message: '请输入查询内容' }],
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  handleInfoCancel = () => {
    this.setState({
      infoVisible: false,
    });
  };

  reissueCertificate = (personInfo: any) => {
    this.setState({
      certificateFormVisible: true,
      certificateInfo: personInfo,
    });
  };

  certificateFormCancel = () => {
    this.setState({
      certificateFormVisible: false,
    });
  };

  addCertificate = (value: any) => {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;

    this.setState({
      certificateLoading: true,
    });

    return fetch('/api/person/certificate/reissue', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: loginInfo.id,
        person_id: this.state.certificateInfo.id,
        type: value.type,
        reason: value.reason,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.setState({
            certificateFormVisible: false,
            certificateLoading: false,
          });
        } else {
          message.error('补发失败，请重试');
          this.setState({
            certificateLoading: false,
          });
        }
      });
  };

  handleCancel = () => {
    this.setState({ personFormVisible: false });
  };

  handleAdd = (values: any) => {
    console.log('handleAdd values of form: ', values);
    this.createPerson(values);
    this.setState({ personFormVisible: false });
  };

  handleEdit = (values: any) => {
    this.editPerson(values);
    this.setState({ personFormVisible: false });
  };

  createPerson(params: any) {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;
    params.admin_id = loginInfo.person_id;

    return fetch('/api/person/create', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify(params),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.getPersonsList();
        }
      });
  }

  editPerson(params: any) {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;
    params.admin_id = loginInfo.person_id;

    return fetch('/api/person/update', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify(params),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.getPersonsList();
        }
      });
  }

  render() {
    if (!this.state.personInfoList.length) {
      return <PageLoading />;
    }

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handlePersonFormVisible(true)}>
                新建
              </Button>
            </div>
            <Table
              columns={this.columns}
              bordered
              dataSource={this.state.personInfoList}
              pagination={this.state.pagination}
              onChange={this.handleTableChange}
            />
          </div>
          <CreatePersonForm
            personFormVisible={this.state.personFormVisible}
            onCancel={this.handleCancel}
            handleAdd={this.handleAdd}
            handleEdit={this.handleEdit}
            positionList={this.state.positionList}
            roleList={this.state.roleList}
            statusList={this.state.statusList}
            editData={this.state.editData}
            siteList={this.state.siteList}
          />

          <PersonInfoView
            visible={this.state.infoVisible}
            onCancel={this.handleInfoCancel}
            reissueCertificate={this.reissueCertificate}
            personInfo={this.state.personInfo}
          />

          <CertificateForm
            visible={this.state.certificateFormVisible}
            loading={this.state.certificateLoading}
            onCancel={this.certificateFormCancel}
            addCertificate={this.addCertificate}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<FormComponentProps>()(PersonInfoList);
