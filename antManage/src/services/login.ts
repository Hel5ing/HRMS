import request from '@/utils/request';

export interface LoginParamsType {
  user_id: string;
  password: string;
}

export async function fakeAccountLogin(params: LoginParamsType) {
  return request('/api/account/login', {
    method: 'POST',
    data: {
      user_id: params.user_id,
      password: btoa(params.password),
    },
  });
}
