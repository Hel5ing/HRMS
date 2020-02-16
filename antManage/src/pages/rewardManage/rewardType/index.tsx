import React from 'react';
import { Table, Button, Modal, Form, Input, Card, Select } from 'antd';
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
  parentList?: any[];
}

interface CreateFormProps extends FormComponentProps {
  visible: boolean;
  handleAdd: (fieldsValue: { desc: string }) => void;
  onCancel: () => void;
  dataInfo?: any;
  parentList?: any[];
}

const CreateForm = Form.create<CreateFormProps>()(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, handleAdd, dataInfo, parentList, onCancel, form } = this
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
            <Form.Item label="奖惩分类名称">
              {getFieldDecorator('name', {
                initialValue: dataInfo ? dataInfo.name : '',
                rules: [{ required: true, message: '请输入奖惩分类名称！' }],
              })(<Input />)}
            </Form.Item>
            {dataInfo ? null : (
              <Form.Item style={{ marginBottom: 15 }} label="选择上级分类(创建一级分类不用选择)">
                {getFieldDecorator(
                  'parent_id',
                  {},
                )(
                  <Select style={{ width: 200 }}>
                    {parentList
                      ? parentList.map((data: any) => {
                          return (
                            <Select.Option key={data.id} value={data.id}>
                              {data.name}
                            </Select.Option>
                          );
                        })
                      : null}
                  </Select>,
                )}
              </Form.Item>
            )}
          </Form>
        </Modal>
      );
    }
  },
);

class RewardType extends React.Component<FormComponentProps> {
  columns = [
    {
      title: '奖惩分类id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '奖惩分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类级别',
      dataIndex: 'parent_id',
      key: 'parent_id',
      render: (parentId: number) => (parentId ? <div>二级分类</div> : <div>一级分类</div>),
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => (
        <div>
          <Button type="primary" onClick={() => this.editBtnHandler(record)}>
            修改
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
    return fetch('/api/rap/category/list', {
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
        if (json.success) {
          let list: any[] = [];
          let parentList: any[] = [];
          (json.response as []).forEach((data: any, index: number) => {
            let item: any = data.category;
            item.key = item.id;

            let childList: any[] = data.children;
            if (childList && childList.length > 0) {
              childList.forEach((childData: any) => {
                childData.key = childData.id;
              });
              item.children = data.children;
            }

            list.push(item);

            if (!data.category.parent_id) {
              parentList.push(data.category);
            }
          });
          console.log('----list : ', list);
          const pagination = { ...this.state.pagination };
          pagination.total = json.response.total ? json.response.total : 1;
          this.setState({
            pagination,
            dataList: list,
            parentList: parentList,
          });
        } else {
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
    return fetch('/api/rap/category/create', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        name: values.name,
        parent_id: values.parent_id,
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
    return fetch('/api/rap/category/update', {
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
            parentList={this.state.parentList}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default Form.create<FormComponentProps>()(RewardType);
