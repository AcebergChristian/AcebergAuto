import React, { useEffect, useState, useRef, useMemo, useCallback, } from 'react';
import { Radio, Select, Button, Form, Input, Tag, Table, Modal, Upload, Message, Descriptions, Grid, DatePicker } from '@arco-design/web-react';
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

const Bugs = (() => {
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
      title: 'Key',
      dataIndex: 'key',
      ellipsis: true
    },
    {
      title: 'Product',
      dataIndex: 'product',
      ellipsis: true,
    },
    {
      title: 'Module',
      dataIndex: 'module',
      ellipsis: true,
    },
    {
      title: 'Version',
      dataIndex: 'version',
      ellipsis: true,
    },
    {
      title: 'Assigner',
      dataIndex: 'assigner',
      ellipsis: true,
    },
    {
      title: 'Enddatetime',
      dataIndex: 'enddatetime',
      ellipsis: true,
    },
    {
      title: 'Feedbackor',
      dataIndex: 'feedbackor',
      ellipsis: true,
    },
    {
      title: 'Mail',
      dataIndex: 'mail',
      ellipsis: true,
    },
    {
      title: 'Bugtype',
      dataIndex: 'bugtype',
      ellipsis: true,
    },
    {
      title: 'System',
      dataIndex: 'system',
      ellipsis: true,
    },
    {
      title: 'Browser',
      dataIndex: 'browser',
      ellipsis: true,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'Bugcontent',
      dataIndex: 'bugcontent',
      ellipsis: true,
    },
    {
      title: 'Demand',
      dataIndex: 'demand',
      ellipsis: true,
    },
    {
      title: 'Ccto',
      dataIndex: 'ccto',
      ellipsis: true,
    },
    {
      title: 'Createtime',
      dataIndex: 'createtime',
      ellipsis: true,
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      ellipsis: true,
    },
    {
      title: 'Operation',
      dataIndex: 'op',
      width: 120,
      render: (_, record) => (
        <div className={styles.bugs_table_opreation}>
          <Button
            type='secondary'
            size='mini'
            icon={<IconEdit />}
            onClick={() => {
              setisCreate(false)
              updatebugsmodal(record)
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
              delbugs(record)
            }}
          />
        </div>
      ),
    },
  ];

  // 查询接口
  const [data, setdata] = useState({ data: [], total: 0 });
  // 获取数据方法
  const bugs_query = (current = 0, pagesize = 10, product='', title='', bugcontent='') => {
    const currentx = current * pagesize
    apiClient.post('/api/bugs_query',
      { current: currentx, pagesize: pagesize ,product:product, title:title, bugcontent:bugcontent}
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
    bugs_query(0, 10)
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
    const {product, title, bugcontent} = searchform.getFieldsValue()
    bugs_query(current - 1, pageSize, product, title, bugcontent)
    setLoading(true);
    setTimeout(() => {
      setPagination((pagination) => ({ ...pagination, current, pageSize }));
      setLoading(false);
    }, 600);
  }


  const [isCreate, setisCreate] = useState(true); // 新增状态

  // 创建bugs
  const [createmodal_visible, setcreatemodal_visible] = useState(false);

  const [createform] = Form.useForm();
  const [createformloading, setcreateformloading] = useState(false);
  // 创建bugs方法
  const create_bugs = () => {
    try {
      // 创建FormData实例
      const formData = createform.getFieldsValue();

      apiClient.post('/api/bugs_create', formData).then((res) => {
        const { msg, status, data } = res.data;
        if (status === 'success') {
          Message.success(msg);
          setcreateformloading(false)

          setcreatemodal_visible(false);

          bugs_query()
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
    catch (err) {
      console.log(err)
      Message.error('Create Error!')
      setcreateformloading(false)
    }
  }


  // 删除bugs方法
  const delbugs = (item) => {
    Modal.warning({
      title: '删除bugs',
      content: (
        <div>
          <p>您确定要删除名为 {item.title} 的 bugs 吗？</p>
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
                apiClient.post('/api/bugs_del', { key: item.key }).then((res) => {
                  const { msg, status, data } = res.data;
                  if (status === 'success') {
                    Message.success(msg);
                    bugs_query();
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

  const updatebugsmodal = useCallback((record) => {
    setmoduleslist([])
    projects_query()
    usrlist_query()
    createform.resetFields();
    // 在这里更新表单的值
    createform.setFieldsValue(record);
    setcreatemodal_visible(true)
  }, [createform]);

  // 更新bugs方法
  const update_bugs = () => {
      // 创建FormData实例
      const formData = createform.getFieldsValue();
      console.log(formData)
      apiClient.post('/api/bugs_update', formData).then((res) => {
        const { msg, status, data } = res.data;
        if (status === 'success') {
          Message.success(msg);
          setcreateformloading(false)

          setcreatemodal_visible(false);

          bugs_query()
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


  // search form
  const [searchform] = Form.useForm();


  const [projectslist ,setprojectslist] = useState([]);
  const projects_query=useCallback(()=>{
    apiClient.post('/api/projects_list'
    ).then((res) => {
      const { msg, status, data } = res.data;
      if (status === 'success') {
        setprojectslist(data)
      }
      else {
        Message.error(msg);
      }

    }).catch((err) => {
      Message.error('Query Error!')
    })
  },[])

  const [moduleslist, setmoduleslist] = useState([]);
  const module_query=(product)=>{
    apiClient.post('/api/projects_modules',
      {product:product}
    ).then((res) => {
      const { msg, status, data } = res.data;
      if (status === 'success') {
        setmoduleslist(data)
      }
      else {
        Message.error(msg);
      }

    }).catch((err) => {
      Message.error('Query Error!')
    })
  }


  const [usrslist, setusrslist] = useState([]);
  const usrlist_query=()=>{
    apiClient.get('/api/usrlist').then((res) => {
      const { msg, status, data } = res.data;
      if (status === 'success') {
        setusrslist(data)
      }
      else {
        Message.error(msg);
      }

    }).catch((err) => {
      Message.error('Query Error!')
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.bugs_toolbar}>
        <Button
          type='primary'
          size='small'
          onClick={() => {
            setisCreate(true)
            setmoduleslist([])
            projects_query()
            usrlist_query()
            createform.resetFields()
            setcreatemodal_visible(true)
          }}
        > {t['create']} </Button>
        {/* <div className={styles.bugs_toolbar_tag}>
          {datatype.map((item, index) => (
            <Button
              type={gettype == item ? 'primary' : 'secondary'}
              size='mini'
              key={item}
              onClick={() => {
                setLoading(true);
                bugs_query()
                setTimeout(() => {
                  setPagination((pagination) => ({ ...pagination, current: 1, pageSize: 10 }));
                  setLoading(false);
                }, 600);
              }}
            >
              {item}
            </Button>
          ))}
        </div> */}
      </div>
      <div className={styles.bugs_search}>
        <Form
          form={searchform}
          layout='vertical'
          onSubmit={(v) => {
            const {product, title, bugcontent} = v
            bugs_query(0, 10, product, title, bugcontent)
          }}
        >
          <Grid.Row gutter={24}>
            <Grid.Col span={8}>
              <Form.Item label='Product' field='product'>
                <Input placeholder='Please input product' autoComplete='off' />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={8}>
              <Form.Item label='Title' field='title'>
                <Input placeholder='Please input title' autoComplete='off' />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={8}>
              <Form.Item label='Bugcontent' field='bugcontent'>
                <Input placeholder='Please input bugcontent' autoComplete='off' />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>
          <FormItem>
          <Button size='mini' type='primary' htmlType='submit' style={{ marginRight: 24 }}>
            Submit
          </Button>
          <Button
            size='mini'
            style={{ marginRight: 24 }}
            onClick={() => {
              searchform.resetFields()
            }}
          >
            Reset
          </Button>
      </FormItem>
        </Form>
      </div>
      <div className={styles.bugs_content}>
        <Table
          loading={loading}
          // columns={columns}
          columns={columns}
          pagination={pagination}
          data={data.data}
          scroll={{
            y: 320,
            // x: 1000,
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
        title={isCreate? 'Create':'Update'}
        style={{ width: '78%', maxHeight: 600, overflowY: 'auto', overflowX: 'hidden' }}
        visible={createmodal_visible}
        onOk={() => {
          setcreateformloading(true)
          isCreate?create_bugs():update_bugs()
        }}
        okButtonProps={{ loading: createformloading }} // 添加 loading 属性
        onCancel={() => {
          if (!createformloading) {
            setcreatemodal_visible(false)
          }
        }}
      >
        <Form
          form={createform}
          style={{ width: '100%', maxHeight: 400, overflowY: 'auto', overflowX: 'hidden' }}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          layout='vertical'
          // onFinish={onFinish}
          // initialValues={{
          // }}
        >
          <Form.Item
            label="Key"
            field="key"
          >
            <Input
              placeholder="由系统自动生成"
              disabled
            />
          </Form.Item>

          <Grid.Row gutter={24}>
            <Grid.Col span={12}>
              <Form.Item
                label="Product"
                field="product"
                rules={[{  message: 'Please Select!' }]}
              >
                <Select
                  options={projectslist}
                  onChange={(v) => {
                    module_query(v)
                  }}
                />
              </Form.Item>
            </Grid.Col>

            <Grid.Col span={12}>
              <Form.Item
                label="Module"
                field="module"
                rules={[{  message: 'Please Select!' }]}
              >
                <Select
                  options={moduleslist}
                />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row gutter={24}>
            <Grid.Col span={8}>
              <Form.Item
                label="Version"
                field="version"
                rules={[{ required: true, message: 'Please Select!' }]}
              >
                <Select
                  options={['main', 'dev', 'test']}
                />
              </Form.Item>
            </Grid.Col>

            <Grid.Col span={8}>
              <Form.Item
                label="Assigner"
                field="assigner"
                rules={[{  message: 'Please Select!' }]}
              >
                <Select
                  options={usrslist}
                />
              </Form.Item>
            </Grid.Col>

            <Grid.Col span={8}>
              <Form.Item
                label="Enddatetime"
                field="enddatetime"
                rules={[{  message: 'Please input!' }]}
              >
                <DatePicker
                  format={'YYYY-MM-DD HH:mm:ss'}
                  showTime
                />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>


          <Grid.Row gutter={24}>
          
            <Grid.Col span={12}>
              <Form.Item
                label="Feedbackor"
                field="feedbackor"
                rules={[{  message: 'Please Select!' }]}
              >
                <Select
                  options={usrslist}
                />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={12}>
              <Form.Item
                label="Mail"
                field="mail"
                rules={[{  message: 'Please input!' }]}
              >
                <Input autoComplete='off' placeholder='admin@qq.com'/>
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row gutter={24}>
            <Grid.Col span={8}>
              <Form.Item
                label="Bugtype"
                field="bugtype"
                rules={[{  message: 'Please Select!' }]}
              >
                <Select
                  options={['代码错误', '配置相关', '需求变更','安全相关','性能问题','标准规范','测试脚本','设计缺陷','其他']}
                />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={8}>
              <Form.Item
                label="System"
                field="system"
                rules={[{  message: 'Please Select!' }]}
              >
                <Select
                  options={['windows XP', 'windows 7','windos 8', 'windows 10', 'mac', 'linux','ios','android','其他']}
                />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={8}>
              <Form.Item
                label="Browser"
                field="browser"
                rules={[{ required: true, message: 'Please Select!' }]}
              >
                <Select
                  options={['chrome', 'firefox', 'edge', 'ie', 'safari', 'opera','其他']}
                />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Form.Item
            label="Title"
            field="title"
            rules={[{  message: 'Please input!' }]}
          >
            <Input autoComplete='off' />
          </Form.Item>

          <Form.Item
            label="Bugcontent"
            field="bugcontent"
            rules={[{  message: 'Please input!' }]}
          >
            <Textarea
              autoSize={{ minRows: 3, maxRows: 6 }}
              autoComplete='off' />
          </Form.Item>
          
          <Grid.Row gutter={24}>
            <Grid.Col span={12}>
              <Form.Item
                label="demand"
                field="demand"
                rules={[{  message: 'Please Select!' }]}
              >
                <Select
                  options={['需求1', '需求2', '需求3']}
                />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={12}>
              <Form.Item
                label="Ccto"
                field="ccto"
                rules={[{  message: 'Please Select!' }]}
              >
                <Select
                  options={usrslist}
                />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>


        </Form>
      </Modal>


    </div>
  )

})

export default Bugs;
