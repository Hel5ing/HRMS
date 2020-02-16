import React from 'react';
import { Table, Button, Col, message, Form, Input, Row, Select, Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { LoginInfo } from '@/models/login';
import { FormComponentProps } from 'antd/lib/form';
import { PersonInfo } from '../personInfoList/PersonInfoList';
import styles from '../style.less';
import CreateSiteForm from './components/CreateSiteForm';
import { GeographicData } from '../../geographic/Geographic';
import SiteInfoView from './components/SiteInfoView';

export interface SiteInfo {
  key: number;
  id: number;
  name: string;
  status: any;
  type: any;
  group_id: number;
  channel: string;
  region: string;
  province: string;
  city: string;
  district: string;
  address: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  admin?: AdminInfo[];
  star: string;
  code: string;
}

interface AdminInfo {
  id: number;
  site_id: number;
  person_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  person: PersonInfo;
}

interface SiteState {
  infoVisible: boolean;
  siteInfo?: any;
  formVisible: boolean;
  pagination: { current: number; total: number };
  siteInfoList: SiteInfo[];
  cityList?: string[];
  districtList?: string[];
  selectValue?: {
    province: string;
    city: string;
    district: string;
  };
  statusList?: any[];
  siteList?: any[];
  editData?: SiteInfo;
}

const FormItem = Form.Item;
const { Option } = Select;

class SiteInfoList extends React.Component<FormComponentProps> {
  columns = [
    {
      title: '站点编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '站点名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={() => {
            this.showSiteInfo(record.id);
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: '站点经理',
      dataIndex: 'admin',
      key: 'adminName',
      render: (admins: AdminInfo[]) => {
        let str: string = '';
        admins.forEach((data: AdminInfo) => {
          str += data.person.name + ' ';
        });
        return <div>{str}</div>;
      },
    },
    {
      title: '联系方式',
      dataIndex: 'admin',
      key: 'adminMobile',
      render: (admins: AdminInfo[]) => {
        let str: string = '';
        admins.forEach((data: AdminInfo) => {
          str += data.person.mobile + ' ';
        });
        return <div>{str}</div>;
      },
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '区',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '建站时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '站点类型',
      dataIndex: 'type',
      key: 'type',
      render: (data: any) => <div>{data.name}</div>,
    },
    {
      title: '站点星级',
      dataIndex: 'star',
      key: 'star',
    },
    {
      title: '站点状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: any) => <div>{status.name}</div>,
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => (
        <Button type="primary" onClick={() => this.editBtnHandler(record)}>
          编辑
        </Button>
      ),
    },
  ];

  state: SiteState = {
    infoVisible: false,
    formVisible: false,
    pagination: { current: 1, total: 1 },
    siteInfoList: [],
  };

  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(localStorage.getItem(
    'LoginInfo',
  ) as string);
  private token: string = '';

  componentDidMount() {
    this.token =
      'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
    this.getSiteInfoList();
    this.getSiteTypeList();
    this.getStatusList();
  }

  editBtnHandler = (value: SiteInfo) => {
    console.log('----clickEdit: ', value);
    this.setState({
      formVisible: true,
      editData: value,
      selectValue: {
        province: value.province,
        city: value.city,
        district: value.district,
      },
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
        this.getSiteInfoList();
      },
    );
  };

  getSiteInfoList = () => {
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
        limit: 10,
        offset: (this.state.pagination.current - 1) * 10,
      }),
    })
      .then(response => response.json())
      .then(json => {
        (json.response.list as []).forEach((data: SiteInfo, index: number) => {
          data.key = index;
        });
        const pagination = { ...this.state.pagination };
        pagination.total = json.response.total;
        this.setState({
          pagination,
          siteInfoList: json.response.list,
        });
      });
  };

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
        type: 2,
      }),
    })
      .then(response => response.json())
      .then(json => {
        this.setState({
          statusList: json.response,
        });
      });
  }

  getSiteTypeList() {
    if (!this.loginData) return;
    return fetch('/api/enum/sitetype/list', {
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
          siteList: json.response,
        });
      });
  }

  handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const { form } = this.props;

    form.validateFields((err: any, fieldsValue: any) => {
      if (err) return;

      this.searchSite(fieldsValue.type, fieldsValue.value);
    });
  };

  searchSite = (type: string, value: string) => {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;
    return fetch('/api/site/list/query', {
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
        if (!json.success) {
          message.info('没有匹配信息');
          return;
        }
        (json.response.list as []).forEach((data: SiteInfo, index: number) => {
          data.key = index;
        });
        const pagination = { ...this.state.pagination };
        pagination.total = json.response.total;
        this.setState({
          pagination,
          siteInfoList: json.response.list,
        });
      });
  };

  handleFormReset = () => {
    this.getSiteInfoList();
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
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="1">根据站点名称模糊查询</Option>
                  <Option value="2">根据站点编号模糊查询</Option>
                  <Option value="3">根据根据站点类型筛选</Option>
                  <Option value="4">根据省筛选</Option>
                  <Option value="5">根据市筛选</Option>
                  <Option value="6">根据城市级别</Option>
                  <Option value="8">根据站点状态筛选</Option>
                  <Option value="9">根据站点星级筛选[1到7]</Option>
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

  handleCancel = () => {
    this.setState({ formVisible: false });
  };

  handleAdd = (values: any) => {
    console.log('Received values of form: ', values);
    this.createSite(values);
    this.setState({ formVisible: false });
  };

  createSite = (params: any) => {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;

    params.admin_id = loginInfo.person_id;
    params.province = params.geographic.province;
    params.city = params.geographic.city;
    params.district = params.geographic.district;
    params.group_id = loginInfo.group_id;

    return fetch('/api/site/create', {
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
          this.getSiteInfoList();
        }
      });
  };

  handleEdit = (values: any) => {
    console.log('-----handleEdit: ', values);
    this.editSite(values);
    this.setState({ formVisible: false });
  };

  editSite = (params: any) => {
    if (!this.loginData) return;
    let { loginInfo } = this.loginData;
    params.admin_id = loginInfo.person_id;
    params.province = params.geographic.province;
    params.city = params.geographic.city;
    params.district = params.geographic.district;
    params.group_id = loginInfo.group_id;

    return fetch('/api/site/update', {
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
          this.getSiteInfoList();
        }
      });
  };

  onSelectChange = (value: { province: string; city: string; district: string }) => {
    let cityList: string[] = [];
    let cityData: any[] = [];
    let districtList: string[] = [];

    for (let i: number = 0; i < GeographicData.length; i++) {
      if (GeographicData[i].name === value.province) {
        cityData = GeographicData[i].city;
        break;
      }
    }

    if (cityData.length > 0) {
      cityData.forEach(city => {
        if (city.name === value.city) {
          districtList = city.area;
        }
        cityList.push(city.name);
      });
    }

    this.setState({
      cityList: cityList,
      districtList: districtList,
      selectValue: {
        province: value.province,
        city: value.city,
        district: value.district,
      },
    });
  };

  handleFormVisible = (flag?: boolean) => {
    this.setState({
      formVisible: !!flag,
      editData: null,
    });
  };

  showSiteInfo = (siteId: number) => {
    if (!this.loginData) return;

    this.setState({
      infoVisible: true,
      siteInfo: null,
    });

    return fetch('/api/site/detail/byid', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        site_id: siteId,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          this.setState({
            infoVisible: true,
            siteInfo: json.response,
          });
        }
      });
  };

  hideSiteInfo = () => {
    this.setState({
      infoVisible: false,
    });
  };

  render() {
    if (!this.state.siteInfoList.length) {
      return <PageLoading />;
    }

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleFormVisible(true)}>
                新建
              </Button>
            </div>
            <Table
              columns={this.columns}
              bordered
              dataSource={this.state.siteInfoList}
              pagination={this.state.pagination}
              onChange={this.handleTableChange}
            />
          </div>
          <CreateSiteForm
            formVisible={this.state.formVisible}
            onCancel={this.handleCancel}
            handleAdd={this.handleAdd}
            handleEdit={this.handleEdit}
            selectValue={this.state.selectValue}
            cityList={this.state.cityList}
            districtList={this.state.districtList}
            onChange={this.onSelectChange}
            statusList={this.state.statusList}
            editData={this.state.editData}
            siteList={this.state.siteList}
          />

          <SiteInfoView
            visible={this.state.infoVisible}
            onCancel={this.hideSiteInfo}
            siteInfo={this.state.siteInfo}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<FormComponentProps>()(SiteInfoList);
