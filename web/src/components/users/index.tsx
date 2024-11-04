import React, { useEffect, useState, useRef, useMemo, } from 'react';
import { Radio, Select, Button, Form, Input, Tag, Table, Modal, Upload, Message, Descriptions } from '@arco-design/web-react';
import { useLocation, useHistory } from 'react-router-dom';
import useLocale from '@/utils/useLocale';
import styles from './style/index.module.less';
import {
  IconDelete,
  IconEdit,
  IconInfo,
  IconMore,
} from '@arco-design/web-react/icon';
import apiClient from '@/utils/apiService';
import { Group } from 'bizcharts/lib/g-components';
import { RadioGroupContext } from '@arco-design/web-react/es/Radio/group';

const Users = (() => {
  const t = useLocale();
  // 定义form
  const FormItem = Form.Item;
  const [form] = Form.useForm();
  const Option = Select.Option;
  const Textarea = Input.TextArea;

  const location = useLocation();
  const { state } = location;

  const history = useHistory();


  const columns = [
    {
      title: 'Account',
      dataIndex: 'account',
      ellipsis: true,
      width: 80,
    },
    {
      title: 'Password',
      dataIndex: 'password',
      ellipsis: true,
      width: 80,
      render: (text) => text ? `${text.substring(0, 8)}****` : '', // 只展示前3个字符，其余用*替代
    },
    {
      title: 'Role',
      dataIndex: 'role',
      ellipsis: true,
      width: 80,
    },
    {
      title: 'Createtime',
      dataIndex: 'createtime',
      width: 180,
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      ellipsis: true,
      width: 80,
    },
    {
      title: 'Operation',
      dataIndex: 'op',
      width: 120,
      render: (_, record) => (
        <div className={styles.users_table_opreation}>
          <Button
            type='secondary'
            size='mini'
            icon={<IconEdit />}
            onClick={() => {
              setupdatemodal_visible(true);
              updateform.setFieldsValue(record);
            }}
          />
          <Button
            type='secondary'
            size='mini'
            icon={<IconInfo />}
            onClick={() => {
              Modal.info({
                title: record.title,
                style: {
                  height: 'auto',
                  width: '72%',
                },
                content: (
                  <div
                    key={record.key}
                  >
                    <Descriptions
                      border
                      data={Object.keys(record).map(key => ({
                        label: key,
                        value: typeof record[key] === 'string' ? record[key].substring(0, 100) : record[key] // 限制显示长度
                      }))}
                      style={{
                        overflow: 'hidden',
                        overflowY: 'auto',
                      }}
                    />
                  </div>
                )
              });
            }}
          />
          <Button
            type='secondary'
            size='mini'
            icon={<IconDelete />}
            onClick={() => {
              delusers(record)
            }}
          />
        </div>
      ),
    },
  ];

  // 查询接口
  const [data, setdata] = useState({ data: [], total: 0 });
  // 获取数据方法
  const users_query = (current = 0, pagesize = 10) => {
    const currentx = current * pagesize
    apiClient.post('/api/users_query',
      {current: currentx, pagesize: pagesize }
    ).then((res) => {
      const { msg, status, data } = res.data;
      if (status === 'success') {
        setdata(data)

        setPagination((prev) => ({ ...prev, current: 1, total: data.total })); // 更新total
      }
      else {
        Message.error(msg);
      }

    }).catch((err) => {
      Message.error('Query Error!')
    })
  }
  useEffect(() => {
    users_query(0, 10)
    return () => {
      setdata({ data: [], total: 0 }); // 清理状态以防止内存泄漏
    };
  }, [])


  // 点击翻页
  const [pagination, setPagination] = useState({
    sizeCanChange: true,
    showTotal: true,
    pageSize: 10,
    current: 1,
    pageSizeChangeResetCurrent: true,
  });

  const [loading, setLoading] = useState(false);
  function onChangeTable(pagination) {
    const { current, pageSize } = pagination;
    users_query(current - 1, pageSize)
    setLoading(true);
    setTimeout(() => {
      setPagination((pagination) => ({ ...pagination, current, pageSize }));
      setLoading(false);
    }, 600);
  }


  // 创建users
  const [createmodal_visible, setcreatemodal_visible] = useState(false);

  const [createform] = Form.useForm();
  const [createformloading, setcreateformloading] = useState(false);
  // 创建users方法
  const create_users = () => {

      const formData = createform.getFieldsValue()

      apiClient.post('/api/users_create', formData).then((res) => {
        const { msg, status, data } = res.data;
        if (status === 'success') {
          Message.success(msg);
          setcreateformloading(false)
          
          setcreatemodal_visible(false);

          users_query()
        }
        else {
          Message.error(msg);
          setcreateformloading(false)
        }
      }).catch((err) => {
        Message.error('Create Error!')
        setcreateformloading(false)
      })
    }


  // 删除agent方法
  const delusers = (item) => {
    Modal.warning({
      title: '删除users',
      content: (
        <div>
          <p>您确定要删除名为 {item.title} 的 users 吗？</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button type="secondary" onClick={() => {
              Modal.destroyAll(); // 关闭所有模态框
            }}>
              {t['cancel']}
            </Button>
            <Button
              type="primary"
              status='warning'
              style={{ marginLeft: '12px' }}
              onClick={() => {
                // 在这里添加删除操作的代码
                apiClient.post('/api/users_del', { key: item.key }).then((res) => {
                  const { msg, status, data } = res.data;
                  if (status === 'success') {
                    Message.success(msg);
                    users_query();
                    Modal.destroyAll(); // 关闭所有模态框
                  } else {
                    Message.error(msg);
                  }
                }).catch((err) => {
                  Message.error('Delete Error！');
                });
              }}>
              {t['confirm']}
            </Button>
          </div>
        </div>
      ),
      okButtonProps: {
        style: { display: 'none' }
      },
      cancelButtonProps: {
        style: { display: 'none' }
      }
    });
  }

  const [updateform] = Form.useForm();
  const [updatemodal_visible, setupdatemodal_visible] = useState(false);
  const [updateformloading, setupdateformloading] = useState(false);
  // 更新agent方法
  const update_users = () => {
    const formData = updateform.getFieldsValue()

      apiClient.post('/api/users_update', formData).then((res) => {
        const { msg, status, data } = res.data;
        if (status === 'success') {
          Message.success(msg);
          setupdateformloading(false)
          
          setupdatemodal_visible(false);

          users_query()
        }
        else {
          Message.error(msg);
          setupdateformloading(false)
        }
      }).catch((err) => {
        Message.error('Create Error!')
        setupdateformloading(false)
      })
  }

  return (
    <div className={styles.container}>
      <div className={styles.users_toolbar}>
        <Button
          type='primary'
          size='small'
          onClick={() => {
            createform.resetFields()
            setcreatemodal_visible(true)
          }}
        > {t['create']} </Button>
      </div>
      <div className={styles.users_content}>
        <Table
          loading={loading}
          columns={columns}
          pagination={pagination}
          data={data.data}
          style={{
            width: '98%',
          }}
          size='mini'
          onChange={onChangeTable}
          renderPagination={(paginationNode) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 10,
              }}
            >
              {paginationNode}
            </div>
          )}
        />

      </div>


      <Modal
        title='Create User'
        visible={createmodal_visible}
        onOk={() => {
          setcreateformloading(true)
          create_users()
        }}
        okButtonProps={{ loading: createformloading }} // 添加 loading 属性
        onCancel={() => {
          if(!createformloading){
            setcreatemodal_visible(false)
          }
        }}
        afterClose={() => createform.resetFields()} // 在模态框关闭后重置表单
      >
        <Form
          form={createform}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          // onFinish={onFinish}
          initialValues={{
            role: 'admin',
          }}
        >
          <Form.Item
            label="Account"
            field="account"
            rules={[{ required: true, message: 'Please input account!' }]}
          >
            <Input autoComplete="off" />
          </Form.Item>

          <Form.Item
            label="Password"
            field="password"
            rules={[{ required: true, message: 'Please input password!' }]}
          >
            <Input type='password' autoComplete='off'/>
          </Form.Item>

          <Form.Item
            label="Role"
            field="role"
            rules={[{ required: true, message: 'Please select role!' }]}
          >
            <Radio.Group
              options={[
                {
                  value: 'admin',
                  label: 'admin',
                },
                {
                  value: 'user',
                  label: 'user',
                }]}
              type='button'
            />
          </Form.Item>

        </Form>
      </Modal>

      {/* 更新modal */}
      <Modal
        title='Update User'
        visible={updatemodal_visible}
        onOk={() => {
          setupdateformloading(true)
          update_users()
        }}
        okButtonProps={{ loading: updateformloading }} // 添加 loading 属性
        onCancel={() => {
          if(!updateformloading){
            setupdatemodal_visible(false)
          }
        }}
        afterClose={() => updateform.resetFields()} // 在模态框关闭后重置表单
      >
        <Form
          form={updateform}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          // onFinish={onFinish}
        >
          <Form.Item
            label="Key"
            field="key"
          >
            <Input autoComplete="off" disabled/>
          </Form.Item>

          <Form.Item
            label="Account"
            field="account"
            rules={[{ required: true, message: 'Please input account!' }]}
          >
            <Input autoComplete="off" />
          </Form.Item>

          <Form.Item
            label="Password"
            field="password"
            rules={[{ required: true, message: 'Please input password!' }]}
          >
            <Input type='password' autoComplete='off'/>
          </Form.Item>

          <Form.Item
            label="Role"
            field="role"
            rules={[{ required: true, message: 'Please select role!' }]}
          >
            <Radio.Group
              options={[
                {
                  value: 'admin',
                  label: 'admin',
                },
                {
                  value: 'user',
                  label: 'user',
                }]}
              type='button'
            />
          </Form.Item>

        </Form>
      </Modal>

    </div>
  )

})


export default Users;