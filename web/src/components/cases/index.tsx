import React, { useEffect, useState, useRef, useMemo, useCallback, } from 'react';
import { Radio, Select, Button, Form, Input, Tag, Table, Modal, Upload, Message, Descriptions, Grid, Space, TableInstance } from '@arco-design/web-react';
import { useLocation, useHistory } from 'react-router-dom';
import useLocale from '@/utils/useLocale';
import styles from './style/index.module.less';
import {
  IconArrowFall,
  IconArrowRise,
  IconDelete,
  IconEdit,
  IconInfo,
  IconMore,
  IconPlayArrow,
} from '@arco-design/web-react/icon';
import apiClient from '@/utils/apiService';
import { Group } from 'bizcharts/lib/g-components';
import EditableTable from '@/components/editabletable'

const Cases = (() => {
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
      ellipsis: true,
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
      title: 'Casetype',
      dataIndex: 'casetype',
      ellipsis: true,
    },
    {
      title: 'Stage',
      dataIndex: 'stage',
      ellipsis: true,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      ellipsis: true,
      width: 50,
    },
    {
      title: 'Precondition',
      dataIndex: 'precondition',
      ellipsis: true,
      width: 80,
    },
    {
      title: 'Testtype',
      dataIndex: 'testtype',
      ellipsis: true,
      width: 50,
    },
    {
      title: 'Testcontent',
      dataIndex: 'testcontent',
      ellipsis: true,
    },
    {
      title: 'Createtime',
      dataIndex: 'createtime',
      ellipsis: true,
      width: 120,
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      ellipsis: true,
    },
    {
      title: 'Operation',
      dataIndex: 'op',
      width: 160,
      render: (_, record) => (
        <div className={styles.cases_table_opreation}>
          <Button
            type='secondary'
            size='mini'
            icon={<IconEdit />}
            onClick={() => {
              updatecasesmodal(record)
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
                  width: '80%',
                },
                content: (
                  <div
                    key={record.key}
                  >
                    <Descriptions
                      border
                      data={Object.keys(record).map(key => ({
                        label: key,
                        value: typeof record[key] === 'string' ? record[key].substring(0, 40) : record[key] // 限制显示长度
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
              delcases(record)
            }}
          />
          <Button
            type='secondary'
            size='mini'
            icon={<IconPlayArrow />}
            loading={runstatus.key == record.key?runstatus.loading : false}
            disabled={runstatus.key == record.key? runstatus.loading : false}
            onClick={() => {
              runonecase(record)
            }}
          />
        </div>
      ),
    },
  ];

  // 查询接口
  const [data, setdata] = useState({ data: [], total: 0 });
  // 获取数据方法
  const cases_query = (current = 0, pagesize = 10) => {
    const currentx = current * pagesize
    apiClient.post('/api/cases_query',
      { current: currentx, pagesize: pagesize }
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
    cases_query(0, 10)
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
    cases_query(current - 1, pageSize)
    setLoading(true);
    setTimeout(() => {
      setPagination((pagination) => ({ ...pagination, current, pageSize }));
      setLoading(false);
    }, 600);
  }

  const editablecreatedatadefault = [
    {
      key: '1',
      step: '',
      action: '',
      element: '',
      content: '',
      // exceptionaction: '',
      // exceptionele:'',
      // excepcontent: '',
    },
    {
      key: '2',
      step: '',
      action: '',
      element: '',
      content: '',
      // exceptionaction: '',
      // exceptionele:'',
      // excepcontent: '',
    },
    {
      key: '3',
      step: '',
      action: '',
      element: '',
      content: '',
      // exceptionaction: '',
      // exceptionele:'',
      // excepcontent: '',
    }
  ]
  
  // 创建cases
  const [createmodal_visible, setcreatemodal_visible] = useState(false);

  const [createform] = Form.useForm();
  const [createformloading, setcreateformloading] = useState(false);
  // 创建cases方法
  const create_cases = () => {
    try {
      const newcases = createform.getFieldsValue();

      const formData = {}

      for (let i in Object.keys(newcases)) {
        formData[Object.keys(newcases)[i]] = newcases[Object.keys(newcases)[i]]
        // if (Object.keys(newcases)[i] === 'testtype'){
        if (newcases[Object.keys(newcases)[i]] === 'auto') {
          formData['testcontent'] = editableTableData ? editableTableData : [];
        }
        else {
          const testcontent = { "method": "post", "path": newcases.path, "body": newcases.body, "statuscode": newcases.statuscode, "msg": newcases.msg }
          formData['testcontent'] = testcontent
        }
        // }
      }


      apiClient.post('/api/cases_create', formData).then((res) => {
        const { msg, status, data } = res.data;
        if (status === 'success') {
          Message.success(msg);
          setcreateformloading(false)

          setcreatemodal_visible(false);

          cases_query()
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
      Message.error('Create Error!')
      setcreateformloading(false)
    }
  }

  const [editableTableData, setEditableTableData] = useState([]); // 新增状态来存储 EditableTable 数据
  const handleGetData = (data) => {
    setEditableTableData(data);
  };

  // 更新cases
  const [updatemodal_visible, setupdatemodal_visible] = useState(false);
  const [updateform] = Form.useForm();
  const [updateformloading, setupdateformloading] = useState(false);
  // 创建cases方法
  const update_cases = () => {
    // try {
      const newcases = updateform.getFieldsValue();
      const formData = {}

      for (let i in Object.keys(newcases)) {
        formData[Object.keys(newcases)[i]] = newcases[Object.keys(newcases)[i]]
        // if (Object.keys(newcases)[i] === 'testtype'){
        if (newcases[Object.keys(newcases)[i]] === 'auto') {
          formData['testcontent'] = editableTableData ? editableTableData : [];
        }
        else {
          const testcontent = { "method": "post", "path": newcases.path, "body": newcases.body, "statuscode": newcases.statuscode, "msg": newcases.msg }
          formData['testcontent'] = testcontent
        }
        // }
      }


      apiClient.post('/api/cases_update', formData).then((res) => {
        const { msg, status, data } = res.data;
        if (status === 'success') {
          Message.success(msg);
          setupdateformloading(false)

          setupdatemodal_visible(false);

          cases_query()
        }
        else {
          Message.error(msg);
          setupdateformloading(false)
        }
      }).catch((err) => {
        Message.error(err+'')
        setupdateformloading(false)
      })
    // }
    // catch (err) {
      
    //   Message.error(err+'')
    //   setupdateformloading(false)
    // }
  }

  // Update Modal 回显
  const [editableupdatedata, seteditableupdatedata] = useState([])
  const updatecasesmodal = useCallback((record) => {
    
    setmoduleslist([])
    projects_query()
    updateform.resetFields();
    // 在这里更新表单的值
    updateform.setFieldsValue(record);
    if(record.testtype == 'auto'){
      try {
        seteditableupdatedata(JSON.parse(record.testcontent))
      }
      catch (err) {
        seteditableupdatedata(editablecreatedatadefault)
      }
    }
    else{
      updateform.setFieldsValue(JSON.parse(record.testcontent));
    }

    setupdatemodal_visible(true)
  }, [updateform]);


  // 删除agent方法
  const delcases = (item) => {
    Modal.warning({
      title: '删除cases',
      content: (
        <div>
          <p>您确定要删除名为 {item.title} 的 cases 吗？</p>
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
                apiClient.post('/api/cases_del', { key: item.key }).then((res) => {
                  const { msg, status, data } = res.data;
                  if (status === 'success') {
                    Message.success(msg);
                    cases_query();
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


  // 运行一个
  const [runstatus, setrunstatus] = useState({key:'',loading:false});
  const runonecase = (item) => {
    setrunstatus({key:item.key,loading:true})

    apiClient.post('/api/cases_runone', item ).then((res) => {
      const { msg, status, data } = res.data;
      if (status === 'success') {
        Message.success(msg);
      } else {
        Message.error(msg);
      }
      setrunstatus({...runstatus,loading:false})
    }).catch((err) => {
      Message.error(err+'');
      setrunstatus({...runstatus,loading:false})
    });
  }

  // 查看运行结果
  const table = useRef<TableInstance>(null);
  const casesresapi=()=>{
    apiClient.get('/api/casesresall',{}).then((res) => {
      const { msg, status, data } = res.data;
      if (status === 'success') {
        casesresfunc(data)
      } else {
        Message.error(msg);
      }
    }).catch((err) => {
      Message.error(''+err);
    });
  }
  const casesresfunc = (data) =>{
    data.forEach((item) => {
      item.testres = item.testres==1?"成功":"失败";
    })
    const casesrescolumns = [
      { title:'title', dataIndex:'title',ellipsis: true,},
      { title:'precondition', dataIndex:'precondition',ellipsis: true,},
      { title:'casetype', dataIndex:'casetype',ellipsis: true,},
      { title:'createtime', dataIndex:'createtime',ellipsis: true,},
      { title:'creator', dataIndex:'creator',ellipsis: true,},
      { title:'testres', dataIndex:'testres',ellipsis: true,}
    ]
    Modal.info({
      title: 'cases运行结果',
      style: { width: '80%' },
      content: (
        <div>
          <Table
            ref={table}
            size='mini'
            border
            columns={casesrescolumns}
            data={data}
            pagination={false}
            scroll={{
              y: 320,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button
              type="primary"
              onClick={() => {
                Modal.destroyAll(); // 关闭所有模态框
                }
              }>
              {t['close']}
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


  const [projectslist, setprojectslist] = useState([]);
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

  return (
    <div className={styles.container}>
      <div className={styles.cases_toolbar}>
      <div className={styles.cases_toolbar_left}>
        <Button
          type='primary'
          size='small'
          onClick={() => {
            projects_query()
            setmoduleslist([])
            createform.resetFields()
            setcreatemodal_visible(true)
          }}
        > {t['create']} </Button>
      </div>

      <div className={styles.cases_toolbar_right}>
        <Button
          type='secondary'
          size='small'
          icon={<IconPlayArrow />}
          onClick={() => {
            Message.info('Run !')
          }
          }
        />

        <Button
          type='secondary'
          size='small'
          icon={<IconInfo />}
          onClick={() => {
            casesresapi()
            }
          }
        />
      </div>

      </div>
      <div className={styles.cases_content}>
        <Table
          loading={loading}
          columns={columns}
          pagination={pagination}
          data={data.data}
          style={{
            width: '98%',
          }}
          scroll={{x: true}}
          size='mini'
          onChange={onChangeTable}
          renderPagination={(paginationNode) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 10,
                zIndex: 20,
              }}
            >
              {paginationNode}
            </div>
          )}
        />

      </div>

      {/* 创建Modal */}
      <Modal
        title='Create'
        style={{ width: '78%', maxHeight: 600, overflowY: 'auto', overflowX: 'hidden' }}
        visible={createmodal_visible}
        onOk={() => {
          handleGetData(editableTableData); // 获取 EditableTable 数据
          createform.validate().then(() => {
            setcreateformloading(true)
            create_cases();
          }).catch(e => {
            Message.error('某些字段是必填的！');
          });
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
          // onFinish={onFinish}
          layout='vertical'
          initialValues={{
            testtype: 'auto'
          }}
        >
          <Grid.Row gutter={24}>
            <Grid.Col span={12}>
              <Form.Item
                label="Product"
                field="product"
                rules={[{ required: true, message: 'Please Select!' }]}
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
                // rules={[{ required: true, message: 'Please Select!' }]}
              >
                <Select
                  options={moduleslist}
                />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row gutter={24}>
            <Grid.Col span={12}>
              <Form.Item
                label="Casetype"
                field="casetype"
                // rules={[{ required: true, message: 'Please Select!' }]}
              >
                <Select
                  options={['功能测试', '性能测试', '配置相关', '部署相关', '安全相关', '接口测试', '其他']}
                />
              </Form.Item>
            </Grid.Col>

            <Grid.Col span={12}>
              <Form.Item
                label="Stage"
                field="stage"
                // rules={[{ required: true, message: 'Please Select!' }]}
              >
                <Select
                  options={['单元测试阶段', '功能测试阶段', '集成测试阶段', '系统测试阶段', '冒烟测试阶段', '版本验证阶段']}
                />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row gutter={24}>
            <Grid.Col span={12}>
              <Form.Item
                label="Title"
                field="title"
                rules={[{ required: true, message: 'Please input!' }]}
              >
                <Input
                  placeholder="Please input your title"
                  autoComplete='off'
                />
              </Form.Item>
            </Grid.Col>

            <Grid.Col span={12}>
              <Form.Item
                label="Priority"
                field="priority"
                // rules={[{ required: true, message: 'Please Select!' }]}
              >
                <Select
                  options={['低', '中', '高', '急']}
                />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <FormItem label='Precondition' field='precondition'
            labelAlign='left'
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 2 }}
            />
          </FormItem>

          <Form.Item field='testtype' label='Testtype'>
            <Radio.Group type='button' options={['auto', 'api']} ></Radio.Group>
          </Form.Item>

          <Form.Item shouldUpdate noStyle>
            {(values) => {
              return values.testtype === 'api' ? (
                <>
                  <Grid.Row gutter={24}>
                    <Grid.Col span={8}>
                      <Form.Item
                        label="Method"
                        field="method"
                        // rules={[{ required: true, message: 'Please Select!' }]}
                      >
                        <Select
                          options={['post', 'get']}
                        />
                      </Form.Item>
                    </Grid.Col>

                    <Grid.Col span={16}>
                      <Form.Item
                        label="Path"
                        field="path"
                        rules={[{ required: true, message: 'Please input!' }]}
                      >
                        <Input
                          placeholder="Please input path!"
                          autoComplete='off'
                        />
                      </Form.Item>
                    </Grid.Col>
                  </Grid.Row>
                  <Form.Item field='body' label='Body'
                    rules={[{ required: true, message: 'Please input!' }]}>
                    <Input.TextArea
                      placeholder='Please enter Body!'
                      autoSize={{ minRows: 3, maxRows: 5 }}
                    />
                  </Form.Item>
                  <Grid.Row gutter={24}>
                    <Grid.Col span={8}>
                      <Form.Item
                        label="Statuscode"
                        field="statuscode"
                        rules={[{ required: true, message: 'Please input!' }]}
                      >
                        <Select
                          options={['200', '201', '202', '203', '401', '403', '404', '500', '502', '503', '504',]}
                        />
                      </Form.Item>
                    </Grid.Col>

                    <Grid.Col span={16}>
                      <Form.Item
                        label="Msg"
                        field="msg"
                        rules={[{ required: true, message: 'Please input!' }]}
                      >
                        <Input
                          placeholder="Please input path!"
                          autoComplete='off'
                        />
                      </Form.Item>
                    </Grid.Col>
                  </Grid.Row>
                </>
              ) : (
                values.testtype === 'auto' && (
                  <Form.Item>
                    {/* <Form.Item field='B' label='Name B'> */}
                    {createmodal_visible && <EditableTable onDataGet={handleGetData} editabledata={ editablecreatedatadefault } />}
                  </Form.Item>
                )
              );
            }}
          </Form.Item>
        </Form>
      </Modal>


      {/* 更新Modal */}
      <Modal
        title='Update'
        style={{ width: '78%', maxHeight: 600, overflowY: 'auto', overflowX: 'hidden' }}
        visible={updatemodal_visible}
        onOk={() => {
          handleGetData(editableTableData); // 获取 EditableTable 数据
          updateform.validate().then(() => {
            setupdateformloading(true)
            update_cases();
          }).catch(e => {
            Message.error('某些字段是必填的！');
          });
        }}
        okButtonProps={{ loading: createformloading }} // 添加 loading 属性
        onCancel={() => {
          if (!updateformloading) {
            setupdatemodal_visible(false)
          }
        }}
      >
        <Form
          form={updateform}
          style={{ width: '100%', maxHeight: 400, overflowY: 'auto', overflowX: 'hidden' }}
          // onFinish={onFinish}
          layout='vertical'
        >
          <Form.Item
            label="Key"
            field="key"
          >
            <Input
              disabled
            />
          </Form.Item>
          <Grid.Row gutter={24}>
            <Grid.Col span={12}>
              <Form.Item
                label="Product"
                field="product"
                rules={[{ required: true, message: 'Please Select!' }]}
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
                // rules={[{ required: true, message: 'Please Select!' }]}
              >
                <Select
                  options={moduleslist}
                />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row gutter={24}>
            <Grid.Col span={12}>
              <Form.Item
                label="Casetype"
                field="casetype"
                rules={[{ required: true, message: 'Please Select!' }]}
              >
                <Select
                  // options={['功能测试', '性能测试', '配置相关', '部署相关', '安全相关', '接口测试', '其他']}
                />
              </Form.Item>
            </Grid.Col>

            <Grid.Col span={12}>
              <Form.Item
                label="Stage"
                field="stage"
                rules={[{ required: true, message: 'Please Select!' }]}
              >
                <Select
                  // options={['单元测试阶段', '功能测试阶段', '集成测试阶段', '系统测试阶段', '冒烟测试阶段', '版本验证阶段']}
                />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row gutter={24}>
            <Grid.Col span={12}>
              <Form.Item
                label="Title"
                field="title"
                rules={[{ required: true, message: 'Please input!' }]}
              >
                <Input
                  placeholder="Please input your title"
                  autoComplete='off'
                />
              </Form.Item>
            </Grid.Col>

            <Grid.Col span={12}>
              <Form.Item
                label="Priority"
                field="priority"
                // rules={[{ required: true, message: 'Please Select!' }]}
              >
                <Select
                  options={['低', '中', '高', '急']}
                />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <FormItem label='Precondition' field='precondition'
            labelAlign='left'
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 2 }}
            />
          </FormItem>

          <Form.Item field='testtype' label='Testtype'>
            <Radio.Group type='button' options={['auto', 'api']} disabled></Radio.Group>
          </Form.Item>

          <Form.Item shouldUpdate noStyle>
            {(values) => {
              return values.testtype === 'api' ? (
                <>
                  <Grid.Row gutter={24}>
                    <Grid.Col span={8}>
                      <Form.Item
                        label="Method"
                        field="method"
                        rules={[{ required: true, message: 'Please Select!' }]}
                      >
                        <Select
                          options={['post', 'get']}
                        />
                      </Form.Item>
                    </Grid.Col>

                    <Grid.Col span={16}>
                      <Form.Item
                        label="Path"
                        field="path"
                        rules={[{ required: true, message: 'Please input!' }]}
                      >
                        <Input
                          placeholder="Please input path!"
                          autoComplete='off'
                        />
                      </Form.Item>
                    </Grid.Col>
                  </Grid.Row>
                  <Form.Item field='body' label='Body'
                    rules={[{ required: true, message: 'Please input!' }]}>
                    <Input.TextArea
                      placeholder='Please enter Body!'
                      autoSize={{ minRows: 3, maxRows: 5 }}
                    />
                  </Form.Item>
                  <Grid.Row gutter={24}>
                    <Grid.Col span={8}>
                      <Form.Item
                        label="Statuscode"
                        field="statuscode"
                        rules={[{ required: true, message: 'Please input!' }]}
                      >
                        <Select
                          options={['200', '201', '202', '203', '401', '403', '404', '500', '502', '503', '504',]}
                        />
                      </Form.Item>
                    </Grid.Col>

                    <Grid.Col span={16}>
                      <Form.Item
                        label="Msg"
                        field="msg"
                        rules={[{ required: true, message: 'Please input!' }]}
                      >
                        <Input
                          placeholder="Please input path!"
                          autoComplete='off'
                        />
                      </Form.Item>
                    </Grid.Col>
                  </Grid.Row>
                </>
              ) : (
                values.testtype === 'auto' && (
                  <Form.Item>
                    {/* <Form.Item field='B' label='Name B'> */}
                    {(createmodal_visible || updatemodal_visible) && <EditableTable onDataGet={handleGetData} editabledata={editableupdatedata} />}
                  </Form.Item>
                )
              );
            }}
          </Form.Item>
        </Form>
      </Modal>

    </div>
  )

})

export default Cases;

