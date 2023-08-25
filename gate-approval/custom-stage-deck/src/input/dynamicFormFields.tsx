import React, { useState } from 'react';
import {
  FormikFormField,
  IFormikStageConfigInjectedProps,
  ILayoutProps,
  IStageForSpelPreview,
  LayoutContext,
  TextInput,
  Tooltip,
  useIsMountedRef,
  ValidationMessage,
  HelpContentsRegistry,
  HelpField,
  ReactSelectInput
} from '@spinnaker/core';
import { FieldArray, FormikProvider } from 'formik';


interface IEvaluateVariablesStageFormProps extends IFormikStageConfigInjectedProps {
  chosenStage: IStageForSpelPreview;
  headers: [];
  blockLabel: string;
  isMultiSupported: boolean;
  selectInput: boolean;
  options: [];
  connectorsList: any;
  listOfConnectorDetails: any;
  accountsOptions: any,
  // accountsList: [];
  handleOnSelection: any ;
  parentIndex: number;
  fieldMapName: string;
}
export function EvaluateVariablesStageForm(props: IEvaluateVariablesStageFormProps) {
  const { formik, headers, blockLabel, isMultiSupported, parentIndex, selectInput, connectorsList, handleOnSelection, fieldMapName, accountsOptions } = props;
  const stage = props.formik.values;
  const parameters: any = stage?.parameters ?? null;
  const keyParameters: any = fieldMapName == 'gateSecurity' ? parameters.gateSecurity : (fieldMapName == 'selectedConnectors' ? parameters.selectedConnectors :  (fieldMapName == 'connectors' ? parameters.connectors :[]));

  // const variables: any = stage?.parameters?.connectors[parentIndex]?.values ?? [];
  const isMountedRef = useIsMountedRef();
  const emptyValue = (() => {
    const obj: any = {};
    headers.forEach((header: any) => {
      obj[header.name] = null;
    });
    return obj;
  })();
  React.useEffect(() => {
    const values = keyParameters[parentIndex].values;
    if ( !values || values.length === 0 ) {
      // This setTimeout is necessary because the interaction between pipelineConfigurer.js and stage.module.js
      // causes this component to get mounted multiple times.  The second time it gets mounted, the initial
      // variable is already added to the array, and then gets auto-touched by SpinFormik.tsx.
      // The end effect is that the red validation warnings are shown immediately when the Evaluate Variables stage is added.
      setTimeout(
        () =>
          isMountedRef.current && formik.setFieldValue(`parameters.${fieldMapName}[${parentIndex}].values`, [emptyValue]),
        100,
      );
    }
  }, [ keyParameters[parentIndex].values]);

  
  const accountsOfSelectedConnector = (connector: string) => {

    // const connector = props.formik.values.parameters.selectedConnectors[0].values[index].connector;
    
    if(accountsOptions.length> 0 && connector){      
      const connectorString = connector.toLowerCase();
      //Find connector type in accounts in list
      console.log("Accounts from Dyamic Field: ", accountsOptions);

      const findIndex =accountsOptions.findIndex((obj: any) => obj.hasOwnProperty(connectorString));
      if(findIndex >= 0){
      const storeconnector = accountsOptions[findIndex][connectorString];
      console.log("Store Connector: ", storeconnector);
      
      return storeconnector.map((option: any) => ({
              "value": option.name,
              "label": option.name
            }));

      }
    }else{
      return []
    }
  }

  const FieldLayoutComponent = React.useContext(LayoutContext);
  const [deleteCount, setDeleteCount] = React.useState(0);


  const deleteConnectorDetails = (connectorName: string) => {
      const connectorsObj = stage.parameters.connectors;
      connectorsObj.forEach((obj: any, index: number) => {
              if(obj.connectorType.toLowerCase() == connectorName.toLowerCase()){
                    connectorsObj.splice(index, 1);
              }
            })
            console.log("Connector Obj", connectorsObj);

            setTimeout(() => {
              stage.parameters.connectors = connectorsObj;   //Addedd
            }, 100);

  }

    const connectorDropdownOptions = () => {
    // Disable Options based on the selection
    let temp:any = [];

    temp = 
    (stage.parameters.selectedConnectors ? 
      (stage.parameters.selectedConnectors.length > 0 ? 
        (stage.parameters.selectedConnectors[0].values ? 
          stage.parameters.selectedConnectors[0].values 
        : []) 
      : []) 
    : []).map((obj:any) => obj.connector);

      let frameConnector = [];
      for (const [key, value] of Object.entries(connectorsList)) {
        let labeloption = value == "Autopilot" ? "Verification" : value
        frameConnector.push({ value: key, label: labeloption, disabled: temp.includes(key) })
      }
      return frameConnector;
    }

  return (
    <>
      <table>
        <thead>
          <tr>
            {/* {JSON.stringify(specificParams)} */}
            {headers.map((header: any) => {
              HelpContentsRegistry.register(blockLabel + header.name, header.helpText);
              return (
                <th key={header.name}>
                  {header.label} <HelpField id={blockLabel + header.name} />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
              {!selectInput ? 
              
              <FormikProvider value={formik}>
            <FieldArray
              key={deleteCount}
              name={`parameters.${fieldMapName}[${parentIndex}].values`}
              render={(arrayHelpers) => (
                
                <>
                  <FieldLayoutComponent input={null} validation={{ hidden: true } as any} />
                  {keyParameters[parentIndex].values ? keyParameters[parentIndex].values.map((_: any, index: number) => {
                    
                    const onDeleteClicked = () => {
                      setDeleteCount((count) => count + 1);
                      arrayHelpers.handleRemove(index)();
                    };
                    return (
                      <tr key={`${deleteCount}-${index}`}>
                        {headers.map((header: any) => (
                          <td key={`${header.name}-td`}>

                          <FormikFormField
                            name={`parameters.${fieldMapName}[${parentIndex}].values[${index}][${header.name}]`}
                            input={(inputProps) => <TextInput {...inputProps} placeholder={` Enter ${header.label}`} />
                          }
                        layout={VariableNameFormLayout}
                        />
                          </td>
                        ))}
                        {isMultiSupported === true ? (
                          <td className="deleteBtn">
                            <Tooltip value="Remove row">
                              <button className="btn btn-sm btn-default" onClick={onDeleteClicked}>
                                <span className="glyphicon glyphicon-trash" />
                              </button>
                            </Tooltip>
                          </td>
                        ) : null}
                      </tr>
                    );
                  })
                :
                // Check for the condition to see if the values key is not present in the json
                []
                }
                  <tr>
                    {isMultiSupported ? (
                      <td colSpan={headers.length + 1}>
                        <button
                          type="button"
                          className="btn btn-block btn-sm add-new"
                          onClick={arrayHelpers.handlePush(emptyValue)}
                        >
                          <span className="glyphicon glyphicon-plus-sign" />
                          Add row
                        </button>
                      </td>
                    ) : null}
                  </tr>
                </>
              )}
            />
          </FormikProvider>
              
              : 
              
              <FormikProvider value={formik}>
            <FieldArray
              key={deleteCount}
              name={`parameters.${fieldMapName}[${parentIndex}].values`}
              render={(arrayHelpers) => (
                
                <>
                  <FieldLayoutComponent input={null} validation={{ hidden: true } as any} />
                  {keyParameters[parentIndex].values.map((_: any, index: number) => {
                    
                    const onConnectorDeleteClicked = () => {
                      setDeleteCount((count) => count + 1);
                      console.log("Clicked Selected Connector: ", _); 
                      arrayHelpers.handleRemove(index)();

                      //Find the selected connector Call function and delete the object from connector
                      if(_.connector){
                        deleteConnectorDetails(_.connector.toLowerCase());
                        

                      }
                    };
                    return (
                      <tr key={`${deleteCount}-${index}`}>
                        {headers.map((header: any) => (
                          <td key={`${header.name}-td`}>

                            {
                             header.label == "Connector" ?
                              <FormikFormField
                              name={`parameters.${fieldMapName}[${parentIndex}].values[${index}][${header.name}]`}
                              input={(inputProps) => 
                                <ReactSelectInput
                                  {...inputProps}
                                  clearable={false}
                                  options={ connectorDropdownOptions() }
                                  value={header.label === 'Connector' ? props.formik.values.parameters.selectedConnectors[0].values[index].connector : props.formik.values.parameters.selectedConnectors[0].values[index].account}
                                  onChange={(e)=> handleOnSelection(e, header.label, index, props)}
                                  //stringOptions={...props}
                                  />
                                  
                            }
                              layout={VariableNameFormLayout}
                            />
                            :
                             <FormikFormField
                              name={`parameters.${fieldMapName}[${parentIndex}].values[${index}][${header.name}]`}
                              input={(inputProps) => 
                                <ReactSelectInput
                                  {...inputProps}
                                  clearable={false}
                                  options={accountsOfSelectedConnector(props.formik.values.parameters.selectedConnectors[0].values[index].connector)}
                                  
                                  />
                            }
                              layout={VariableNameFormLayout}
                            />
                           }
                          </td>
                        ))}
                        {isMultiSupported === true ? (
                          <td className="deleteBtn">
                            <Tooltip value="Remove row">
                              <button className="btn btn-sm btn-default" onClick={onConnectorDeleteClicked}>
                                <span className="glyphicon glyphicon-trash" />
                              </button>
                            </Tooltip>
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                  <tr>
                    {isMultiSupported ? (
                      <td colSpan={headers.length + 1}>
                        <button
                          type="button"
                          className="btn btn-block btn-sm add-new"
                          onClick={arrayHelpers.handlePush(emptyValue)}
                        >
                          <span className="glyphicon glyphicon-plus-sign" />
                          Add row
                        </button>
                      </td>
                    ) : null}
                  </tr>
                </>
              )}
            />
          </FormikProvider>
              
              }

        </tbody>
      </table>
    </>
  );
}
function VariableNameFormLayout(props: ILayoutProps) {
  const { input, validation } = props;
  const { messageNode, category, hidden } = validation;
  return (
    <div className="flex-container-v margin-between-md">
      {input}
      {!hidden && <ValidationMessage message={messageNode} type={category} />}
    </div>
  );
}
