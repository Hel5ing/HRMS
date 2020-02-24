import React from 'react';
import { FormComponentProps } from 'antd/lib/form';
import { Tag, Button, Divider, Card, Table, message, Form, Input, Modal } from 'antd';
import { LoginInfo } from '@/models/login';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import styles from './style.less';

interface StateData {
  formVisible: boolean;
  pagination: { current: number; total: number };
  dataList: any[];
  dataInfo?: any;
  categoryList?: any[];
  infoVisible: boolean;
  detailInfo?: any;
  loading: boolean;
}
interface RejectFormProps extends FormComponentProps {
  visible: boolean;
  handleReject: (fieldsValue: { desc: string }) => void;
  onCancel: () => void;
  dataInfo?: any;
}

const RejectForm = Form.create<RejectFormProps>()(
  class extends React.Component {
    render() {
      const { visible, handleReject, dataInfo, onCancel, form } = this.props as RejectFormProps;
      const { getFieldDecorator } = form;

      const onCreate = () => {
        form.validateFields((err: any, fieldsValue: any) => {
          if (err) return;
          form.resetFields();
          handleReject(fieldsValue);
        });
      };

      return (
        <Modal
          visible={visible}
          title={'请输入拒绝原因'}
          okText="确定"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="拒绝原因">
              {getFieldDecorator('reason', {
                initialValue: dataInfo ? dataInfo.reason : '',
                rules: [{ required: true, message: '请输入拒绝原因' }],
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

class ReCertificateAuditList extends React.Component<FormComponentProps> {
  columns = [
    {
      title: '渠道',
      dataIndex: 'person.site.group.channel',
      key: 'channel',
    },
    {
      title: '集团',
      dataIndex: 'person.site.group.name',
      key: 'group',
    },
    {
      title: '站点代码',
      dataIndex: 'person.site.code',
      key: 'code',
    },
    {
      title: '员工工号',
      dataIndex: 'person.employee_id',
      key: 'employee_id',
    },
    {
      title: '姓名',
      dataIndex: 'person.name',
      key: 'name',
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: '证书有效期',
      dataIndex: 'certificate.expiry_date',
      key: 'expiry_date',
    },
    {
      title: '审核结果',
      dataIndex: 'status',
      key: 'status',
      render: (data: any) => (
        <Tag color={data.id == 12 ? 'blue' : data.id == 13 ? 'green' : 'red'}>{data.name}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => (
        <div>
          <Button
            type="primary"
            onClick={() => this.approvalBtnHandler(record)}
            style={record.status.id != 12 ? { display: 'none' } : {}}
          >
            通过
          </Button>
          <Divider type="vertical" />
          <Button
            type="danger"
            onClick={() => this.rejectBtnHandler(record)}
            style={record.status.id != 12 ? { display: 'none' } : {}}
          >
            拒绝
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
    loading: true,
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
    return fetch('/api/audit/list/recertificate', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.person_id,
        limit: 10,
        offset: (this.state.pagination.current - 1) * 10,
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
            loading: false,
          });
        } else {
          this.setState({
            pagination: 1,
            dataList: [],
            loading: false,
          });
        }
      });
  };

  approvalBtnHandler = (value: any) => {
    return fetch('/api/audit/approval/recertificate', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        audit_id: value.id,
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

  rejectBtnHandler = (value: any) => {
    if (!this.loginData) return;
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

  handleReject = (value: any) => {
    console.log(this.state.dataInfo);
    return fetch('/api/audit/reject/recertificate', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        admin_id: this.loginData.loginInfo.id,
        audit_id: this.state.dataInfo.id,
        reason: value.reason,
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

  handleFormVisible = (flag?: boolean) => {
    this.setState({
      formVisible: !!flag,
      dataInfo: null,
    });
  };

  render() {
    if (this.state.loading) {
      return <PageLoading />;
    }

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            {/**<div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleFormVisible(true)}>
                创建信息
              </Button>
            </div>**/}
            <Table
              columns={this.columns}
              bordered
              dataSource={this.state.dataList}
              pagination={this.state.pagination}
              onChange={this.handleTableChange}
            />
          </div>
          {/**
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
          **/}
          <RejectForm
            visible={this.state.formVisible}
            onCancel={this.handleCancel}
            handleReject={this.handleReject}
            dataInfo={this.state.dataInfo}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ReCertificateAuditList;
