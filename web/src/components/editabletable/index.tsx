import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { Button, Table, Input, Select, Form, FormInstance } from '@arco-design/web-react';
const FormItem = Form.Item;
const EditableContext = React.createContext<{ getForm?: () => FormInstance }>({});

function EditableRow(props) {
  const { children, record, className, ...rest } = props;
  const refForm = useRef(null);

  const getForm = () => refForm.current;

  return (
    <EditableContext.Provider
      value={{
        getForm,
      }}
    >
      <Form
        style={{ display: 'table-row' }}
        children={children}
        ref={refForm}
        wrapper='tr'
        wrapperProps={rest}
        className={`${className} editable-row`}
        initialValues={record} 
      />
    </EditableContext.Provider>
  );
}


function EditableCell(props) {
  const { children, className, rowData, column, onHandleSave } = props;
  const ref = useRef(null);
  const refInput = useRef(null);
  const { getForm } = useContext(EditableContext);
  const [editing, setEditing] = useState(false);

  // const handleClick = useCallback(
  //   (e) => {
  //     if (
  //       editing &&
  //       column.editable &&
  //       ref.current &&
  //       !ref.current.contains(e.target) &&
  //       !e.target.classList.contains('js-demo-select-option')
  //     )
  //     {
  //       cellValueChangeHandler(rowData[column.dataIndex]);
  //     }
  //   },
  //   [editing, rowData, column]
  // );
  // useEffect(() => {
  //   editing && refInput.current && refInput.current.focus();
  // }, [editing]);
  // useEffect(() => {
  //   document.addEventListener('click', handleClick, true);
  //   return () => {
  //     document.removeEventListener('click', handleClick, true);
  //   };
  // }, [handleClick]);

  const cellValueChangeHandler = (value) => {
    if (column.dataIndex === 'operation') {
      const values = {
        [column.dataIndex]: value,
      };
      onHandleSave && onHandleSave({ ...rowData, ...values });
      setTimeout(() => setEditing(!editing), 300);

    } 
    else {
      const form = getForm();
      form.validate([column.dataIndex], (errors, values) => {
        if (!errors || !errors[column.dataIndex]) {
          setEditing(!editing);
          onHandleSave && onHandleSave({ ...rowData, ...values });
        }
      });
    }
  };

  const actionoptions = ['exist', 'openurl', 'input', 'click', 'dblclick'];

  // if (editing) {
    return (
      <div ref={ref}>
        {
          column.dataIndex !== 'operation' ? 
          column.dataIndex === 'action' || column.dataIndex === 'exceptionaction' ? (
            <FormItem
              style={{ marginBottom: 0 }}
              labelCol={{ span: 0 }}
              wrapperCol={{ span: 24 }}
              field={column.dataIndex}
              rules={[{ required: true }]}
            >
              <Select
                ref={refInput}
                options={ actionoptions }
                onChange={(v) => {
                  cellValueChangeHandler(v);
                }}
              />
            </FormItem>
          ): column.dataIndex == 'key' ? <div>{rowData[column.dataIndex]}</div> : (
            <FormItem
              style={{ marginBottom: 0 }}
              labelCol={{ span: 0 }}
              wrapperCol={{ span: 24 }}
              field={column.dataIndex}
              rules={[{ required: true }]}
            >
              <Input
                ref={refInput}
                autoComplete='off'
                onChange={(v) => {
                  cellValueChangeHandler(v);
                }}
              />
            </FormItem>
          ) : column.render(rowData)
        }
      </div>
    )
}

    //     {
    //       if(column.dataIndex != 'operation'){
    //         return (
    //           <FormItem
    //               style={{ marginBottom: 0 }}
    //               labelCol={{ span: 0 }}
    //               wrapperCol={{ span: 24 }}
    //               // initialValue={rowData[column.dataIndex]}
    //               field={column.dataIndex}
    //               rules={[{ required: true }]}
    //             >
    //               <Input
    //                 ref={refInput}
    //                 autoComplete='off'
    //                 onChange={(v)=>{
    //                   cellValueChangeHandler(v)
    //                 }}
    //               />
    //           </FormItem>
    //         )
    //       }
    //       else if (column.dataIndex === 'action') { 
    //         return (
    //           <FormItem
    //             style={{ marginBottom: 0 }}
    //             labelCol={{ span: 0 }}
    //             wrapperCol={{ span: 24 }}
    //             field={column.dataIndex}
    //             rules={[{ required: true }]}
    //           >
    //             <Input
    //               ref={refInput}
    //               autoComplete='off'
    //               onChange={(v) => {
    //                 cellValueChangeHandler(v);
    //               }}
    //             />
    //           </FormItem>
    //         );
    //       }
    //     }
    //     </div>
    //   )
    // }


// column.dataIndex != 'operation' ? (
//         <FormItem
//             style={{ marginBottom: 0 }}
//             labelCol={{ span: 0 }}
//             wrapperCol={{ span: 24 }}
//             // initialValue={rowData[column.dataIndex]}
//             field={column.dataIndex}
//             rules={[{ required: true }]}
//           >
//             <Input
//               ref={refInput}
//               autoComplete='off'
//               onChange={(v)=>{
//                 cellValueChangeHandler(v)
//               }}
//             />
//         </FormItem>
//       ) : 
//         column.render(rowData)
    // }
      
    //   </div>
    // );
  // }

  // return (
  //   <div
  //     className={column.editable ? `editable-cell ${className}` : className}
  //     onClick={() => column.editable && setEditing(!editing)}
  //   >
  //     {children}
  //   </div>
  // );



function EditableTable(props) {
  const { onDataGet , editabledata} = props;

  const [data, setData] = useState(editabledata);
  // 使用闭包来捕获当前的 editabledata 值
  useEffect(() => {
    function updateData() {
      setData(editabledata);
    }

    // 调用 updateData 来立即更新 data
    updateData();

    // 返回一个清理函数，在卸载时调用 updateData
    return () => updateData();
  }, []); // 空依赖数组确保仅在组件挂载时运行一次
  
  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      editable: false,
      width: '10%',
    },
    {
      title: 'Step',
      dataIndex: 'step',
      editable: true,
      width: '20%',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      editable: true,
      width: '20%',
    },
    {
      title: 'Element',
      dataIndex: 'element',
      editable: true,
      width: '30%',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      editable: true,
      width: '30%',
    },
    // {
    //   title: 'Exceptionaction',
    //   dataIndex: 'exceptionaction',
    //   editable: true,
    //   width: '30%',
    // },
    // {
    //   title: 'Exceptionele',
    //   dataIndex: 'exceptionele',
    //   editable: true,
    //   width: '30%',
    // },
    // {
    //   title: 'Excepcontent',
    //   dataIndex: 'excepcontent',
    //   editable: true,
    //   width: '30%',
    // },
    {
      title: 'Operation',
      dataIndex: 'operation',
      // editable: false,
      render: (record) => (
        <Button onClick={() => removeRow(record.key)} type='primary' status='danger'>
          Delete
        </Button>
      ),
    },
  ];

  function handleSave(row) {
    const newData = [...data];
    const index = newData.findIndex((item) => row.key === item.key);
    newData.splice(index, 1, { ...newData[index], ...row });
    setData(newData);

    //传给父级方法
    onDataGet(newData);
  }

  function removeRow(key) {
    const newData = data.filter((item) => item.key !== key);
    // 重新排列key
    const updatedData = newData.map((item, index) => ({
      ...item,
      key: `${index + 1}`, // 从1开始重新排列key
    }));
    setData(updatedData);

    //传给父级方法
    onDataGet(updatedData);
  }

  function addRow() {
    const maxKey = data.length > 0 ? Math.max(...data.map(item => parseInt(item.key))) : 0; // 获取当前最大key
    setData(
      data.concat({
        key: `${maxKey + 1}`, // 新行的key为最大key加1
        step: '',
        action: '',
        element: '',
        content: '',
        // exceptionaction: '',
        // exceptionele: '',
        // excepcontent: '',
      })
    );
  }

  useEffect(() => {
    //传给父级方法
    onDataGet(data);
  },[data])


  return (
    <>
      <Button
        style={{ marginBottom: 10,width: 60}}
        type='primary'
        size='default'
        onClick={addRow}
      >
        Add
      </Button>
      <Table
        data={data}
        components={{
          body: {
            row: EditableRow,
            cell: EditableCell,
          },
        }}
        columns={columns.map((column) =>
          column.editable
            ? {
                ...column,
                onCell: () => ({
                  onHandleSave: handleSave,
                }),
              }
            :column
        )}
        className='table-demo-editable-cell'
        noDataElement={<div>No Data</div>}
        pagination={false}
      />
    </>
  );
}

export default EditableTable;


