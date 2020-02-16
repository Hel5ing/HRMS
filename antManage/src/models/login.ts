import { Reducer } from 'redux';
import { routerRedux } from 'dva/router';
import { Effect } from 'dva';
import { stringify } from 'querystring';
import { message } from 'antd';

import { fakeAccountLogin } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';

export interface LoginStateType {
  status?: 'ok' | 'error';
  type?: string;
  passWord?: string;
  loginInfo?: LoginInfo;
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export interface LoginInfo {
  id: number;
  group_id: number;
  person_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  person: UserInfo;
  group: GroupInfo;
}

export interface GroupInfo {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
export interface UserInfo {
  id: number;
  employee_id: number;
  name: string;
  mobile: string;
  email: string;
  identification: string;
  education: {};
  major: {};
  site_id: number;
  position: number;
  role: number;
  level: number;
  avatar: string;
  star: string;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface LoginModelType {
  namespace: string;
  state: LoginStateType;
  effects: {
    login: Effect;
    logout: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<LoginStateType>;
    changeLoginStatus: Reducer<LoginStateType>;
  };
}

const Model: LoginModelType = {
  namespace: 'login',

  state: {},

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      console.log('--login response--: ', response);
      console.log('--login payload--: ', payload);

      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.success) {
        if (response.response) {
          let loginData = {
            passWord: payload.password,
            loginInfo: response.response,
          };
          localStorage.setItem('LoginInfo', JSON.stringify(loginData));
          yield put({
            type: 'saveCurrentUser',
            payload: loginData,
          });
        }
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params as { redirect: string };
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      } else {
        message.error('账号或密码不对，请重新输入');
      }
    },
    *logout(_, { put }) {
      const { redirect } = getPageQuery();
      // redirect
      if (window.location.pathname !== '/user/login' && !redirect) {
        yield put(
          routerRedux.replace({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          }),
        );
      }
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        passWord: action.payload.passWord,
        loginInfo: action.payload.loginInfo || {},
      };
    },
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};

export default Model;
