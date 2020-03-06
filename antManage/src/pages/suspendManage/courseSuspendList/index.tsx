import React from 'react';
import { Table, Button, Modal, Form, Select, Input, Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { LoginInfo } from '@/models/login';
import { FormComponentProps } from 'antd/lib/form';
import styles from '../style.less';
import DetailInfo from './components/DetailInfo';
import SelectPersonView from './components/SelectPersonView';

interface StateData {
  formVisible: boolean;
  pagination: { current: number; total: number };
  dataList: any[];
  infoVisible: boolean;
  detailInfo?: any;
  courseList: any;
  selectValue: {
    item1: any;
    item2: any;
    item3: any;
  };
  selectValueBy: {
    item1: any;
    item2: any;
    item3: any;
  };
}

const { Option } = Select;

interface CreateFormProps extends FormComponentProps {
  visible: boolean;
  handleAdd: (fieldsValue: { desc: string }) => void;
  onCancel: () => void;
  courseList?: any;
  selectValue: {
    item1: any;
    item2: any;
    item3: any;
  };
  selectValueBy: {
    item1: any;
    item2: any;
    item3: any;
  };
  onChange: (value: { item1: any; item2: any; item3: any }) => void;
  onChangeBy: (value: { item1: any; item2: any; item3: any }) => void;
}

const validatorForm = (
  _: any,
  value: {
    item1: any;
    item2: any;
    item3: any;
  },
  callback: (message?: string) => void,
) => {
  const { item3 } = value;
  if (!item3 || !item3.key) {
    callback('请选择员工!');
  }

  callback();
};

const validatorFormBy = (
  _: any,
  value: {
    item1: any;
    item2: any;
    item3: any;
  },
  callback: (message?: string) => void,
) => {
  const { item3 } = value;
  if (!item3 || !item3.key) {
    callback('请选择暂停发起人!');
  }

  callback();
};

const CreateForm = Form.create<CreateFormProps>()(
  class extends React.Component {
    render() {
      const { visible, handleAdd, onChange, onChangeBy, courseList, selectValue, selectValueBy, onCancel, form } = this
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
        <Modal visible={visible} title={'创建'} okText="确定" onCancel={onCancel} onOk={onCreate}>
          <Form layout="vertical">
            <Form.Item label="暂停课程">
              {getFieldDecorator('course', {
                initialValue: [],
                rules: [{ required: true, message: '请选择暂停课程' }],
              })(
                <Select 
                  style={{ width: 300 }} 
                  className={styles.item} 
                  labelInValue 
                  showSearch
                  mode="multiple"
                 >
                  {courseList.map((data: any) => {
                    return <Option key={data.key}>{data.value}</Option>;
                  })}
                </Select>,
              )}
            </Form.Item>

            <Form.Item label="选择暂停员工">
              {getFieldDecorator('person', {
                rules: [
                  { required: true, message: '请选择暂停员工！' },
                  {
                    validator: validatorForm,
                  },
                ],
              })(<SelectPersonView selectValue={selectValue} onChange={onChange} />)}
            </Form.Item>
            <Form.Item label="选择暂停发起人">
              {getFieldDecorator('suspend_by', {
                rules: [
                  { required: true, message: '选择暂停发起人' },
                  {
                    validator: validatorFormBy,
                  },
                ],
              })(<SelectPersonView selectValue={selectValueBy} onChange={onChangeBy} />)}
            </Form.Item>

            <Form.Item label="暂停原因">
              {getFieldDecorator('reason', {
                initialValue: '',
                rules: [{ required: true, message: '请输入暂停原因！' }],
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

class CourseSuspendList extends React.Component<FormComponentProps> {
  columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '员工工号',
      dataIndex: 'authority',
      key: 'employee_id',
      render: (data: any) => <div>{data.engineer.employee_id}</div>,
    },
    {
      title: '员工姓名',
      dataIndex: 'authority',
      key: 'engineerName',
      render: (data: any) => <div>{data.engineer.name}</div>,
    },
    {
      title: '课程名称',
      dataIndex: 'authority',
      key: 'courseName',
      render: (data: any) => <div>{data.course ? data.course.title : ''}</div>,
    },
    {
      title: '暂停原因',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: '暂停日期',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '暂停发起人',
      dataIndex: 'suspend_by.name',
      key: 'suspend_by',
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
    formVisible: false,
    pagination: { current: 1, total: 1 },
    dataList: [],
    infoVisible: false,
    courseList: [],
    selectValue: {
      item1: { label: '', key: '' },
      item2: { label: '', key: '' },
      item3: { label: '', key: '' },
    },
    selectValueBy: {
      item1: { label: '', key: '' },
      item2: { label: '', key: '' },
      item3: { label: '', key: '' },
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
    this.getCourseInfoList();
  }

  getDataInfoList = () => {
    if (!this.loginData) return;
    return fetch('/api/suspend/list', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        type: 1,
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

  getCourseInfoList = () => {
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
        let list: any[] = [];
        (json.response.list as []).forEach((data: any) => {
          let item: any = {};
          item.value = data.title;
          item.key = data.id;

          list.push(item);
        });
        this.setState({
          courseList: list,
        });
      });
  };

  showDetailInfo = (dataId: number) => {
    if (!this.loginData) return;

    this.setState({
      infoVisible: true,
      detailInfo: null,
    });

    return fetch('/api/suspend/detail', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        type: 1,
        suspend_id: dataId,
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

  handleCancel = () => {
    this.setState({ formVisible: false });
  };

  handleAdd = (values: any) => {
    console.log('Received values of form: ', values);

    this.createData(values);

    this.setState({ formVisible: false });
  };

  createData = (values: any) => {
    if (!this.loginData) return;
    return fetch('/api/suspend/course/create', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        person_id: values.person.item3.key,
        course_id: values.course,
        suspend_by: values.suspend_by.item3.key,
        reason: values.reason,
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
      selectValue: {
        item1: { label: '', key: '' },
        item2: { label: '', key: '' },
        item3: { label: '', key: '' },
      },
      selectValueBy: {
        item1: { label: '', key: '' },
        item2: { label: '', key: '' },
        item3: { label: '', key: '' },
      },
    });
  };

  onChange = (value: { item1: any; item2: any; item3: string[] }) => {
    this.setState({
      selectValue: {
        item1: value.item1,
        item2: value.item2,
        item3: value.item3,
      },
    });
  };

  onChangeBy = (value: { item1: any; item2: any; item3: string[] }) => {
    this.setState({
      selectValueBy: {
        item1: value.item1,
        item2: value.item2,
        item3: value.item3,
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
            selectValue={this.state.selectValue}
            selectValueBy={this.state.selectValueBy}
            onChange={this.onChange}
            onChangeBy={this.onChangeBy}
            courseList={this.state.courseList}
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
export default Form.create<FormComponentProps>()(CourseSuspendList);
