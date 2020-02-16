import React, { Component } from 'react';
import { Select } from 'antd';

import styles from './GeographicView.less';
import { LoginInfo } from '@/models/login';

const { Option } = Select;

interface SelectItem {
  label: string;
  key: string;
}
const nullSelectItem: SelectItem = {
  label: '',
  key: '',
};

interface GeographicViewProps {
  selectValue: {
    item1: SelectItem;
    item2: SelectItem;
    item3: SelectItem;
  };
  onChange: (value: { item1: any; item2: any; item3: any }) => void;
}

interface StateData {
  itemList1?: any[];
  itemList2?: any[];
  itemList3?: any[];
}

class SelectPersonView extends Component<GeographicViewProps> {
  state: StateData = {};

  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(
    localStorage.getItem('LoginInfo') as string,
  );
  private token: string = '';

  componentDidMount() {
    this.token =
      'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
    this.getItemList1();
  }

  getItemList1 = () => {
    if (!this.loginData) return;
    return fetch('/api/group/list', {
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
          (json.response.list as []).forEach((data: any) => {
            let item: any = {};
            item.value = data.name;
            item.key = data.id;

            list.push(item);
          });
          this.setState({
            itemList1: list,
          });
        } else {
        }
      });
  };

  getItemList2 = (id: string) => {
    if (!this.loginData) return;
    return fetch('/api/site/list/bygroup', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        group_id: id,
        limit: 999,
        offset: 0,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          let list: any[] = [];
          (json.response.list as []).forEach((data: any) => {
            let item: any = {};
            item.value = data.name;
            item.key = data.id;

            list.push(item);
          });
          this.setState({
            itemList2: list,
          });
        }
      });
  };

  getItemList3 = (id: string) => {
    if (!this.loginData) return;
    return fetch('/api/person/list/bysite', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        limit: 999,
        offset: 0,
        site_id: id,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          let list: any[] = [];
          (json.response.list as []).forEach((data: any) => {
            let item: any = {};
            item.value = data.name;
            item.key = data.id;

            list.push(item);
          });
          this.setState({
            itemList3: list,
          });
        }
      });
  };

  selectItem1 = (item: SelectItem) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange({
        item1: item,
        item2: nullSelectItem,
        item3: nullSelectItem,
      });
    }

    this.getItemList2(item.key);
  };

  selectItem2 = (item: SelectItem) => {
    const { onChange, selectValue } = this.props;
    if (onChange) {
      onChange({
        item1: selectValue.item1,
        item2: item,
        item3: nullSelectItem
      });
    }

    this.getItemList3(item.key);
  };

  selectItem3 = (item: SelectItem) => {
    const { onChange, selectValue } = this.props;
    if (onChange) {
      onChange({
        item1: selectValue.item1,
        item2: selectValue.item2,
        item3: item,
      });
    }
  };

  render() {
    const { selectValue } = this.props;
    return (
      <div>
        <Select
          style={{ width: 100 }}
          className={styles.item}
          value={selectValue.item1}
          labelInValue
          showSearch
          onSelect={this.selectItem1}
        >
          {this.state.itemList1?.map(data => {
            return <Option key={data.key}>{data.value}</Option>;
          })}
        </Select>
        <Select
          style={{ marginLeft: 20, width: 200 }}
          className={styles.item}
          value={selectValue.item2}
          labelInValue
          showSearch
          onSelect={this.selectItem2}
        >
          {this.state.itemList2?.map(data => {
            return <Option key={data.key}>{data.value}</Option>;
          })}
        </Select>
        <Select
          style={{ marginTop: 20, width: 200 }}
          className={styles.item}
          value={selectValue.item3}
          labelInValue
          showSearch
          onSelect={this.selectItem3}
        >
          {this.state.itemList3?.map(data => {
            return <Option key={data.key}>{data.value}</Option>;
          })}
        </Select>
      </div>
    );
  }
}

export default SelectPersonView;