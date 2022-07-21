import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage, Tooltip } from '@spinnaker/core';
import './Verification.less';
import opsMxLogo from './images/OpsMx_logo_Black.svg';

/*
 * You can use this component to provide information to users about
 * how the stage was configured and the results of its execution.
 *
 * In general, you will access two properties of `props.stage`:
 * - `props.stage.outputs` maps to your SimpleStage's `Output` class.
 * - `props.stage.context` maps to your SimpleStage's `Context` class.
 */

export function VerificationExecutionDetails(props: IExecutionDetailsSectionProps) {
  console.log("Verification Gate Execution");
  console.log(props);

  const [modalIsOpen,setModalIsOpen] = useState(false);
  const [canaryUrl, setCanaryUrl] = useState(null)


  useEffect(() => {
    if (props.stage.outputs?.canaryReportURL) {
      let urlPath = props.stage.outputs.canaryReportURL.split("/");
      let path: any[] = [];
      for (let i = urlPath?.length - 1; i >= 6; i--)
        path = [urlPath[i], ...path]
      var constructedPath = path.join("/")
      setCanaryUrl(`${window.location.origin}/ui/plugin-isd/verification/${constructedPath}`)
    }
  }, [])

  
  const getClasses = () => {
    let classes = '';
    if (props.stage.outputs.overallScore < props.stage.context.parameters.minicanaryresult) {
      classes = 'verificationScoreDanger';
    } else if (props.stage.outputs.overallScore > props.stage.context.parameters.canaryresultscore - 1) {
      classes = 'verificationScoreSuccess';
    } else if (
      props.stage.outputs.overallScore < props.stage.context.parameters.canaryresultscore + 1 &&
      props.stage.outputs.overallScore > props.stage.context.parameters.minicanaryresult - 1
    ) {
      classes = 'verificationScoreAlert';
    } else if(props.stage.status == 'RUNNING') {
      classes = 'verificationReportActive';
    } else {
      classes = ''
    }
    return classes;
  };
  const exceptionDiv = props.stage.outputs.exception ? (
    <div className="alert alert-danger">
      <div>
        <h5>Reason </h5>
        <div className="Markdown break-word">
          <p>{props.stage.outputs.exception}</p>
        </div>
      </div>
    </div>
  ) : null;


const setModalIsOpenToTrue =()=>{
    setModalIsOpen(true)
}

const setModalIsOpenToFalse =()=>{
    setModalIsOpen(false);      
}

  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      {props.stage.outputs.overallScore >= 0 ? (
        <div>
          <div className="detailpagelogo align-right">
            {/* <span className={'score ' + getClasses()}>{props.stage.outputs.overallScore}</span>
            {props.stage.outputs.verificationUrl != undefined ? (
              <span className={'clikable score ' + getClasses()} onClick={setModalIsOpenToTrue}>View Report</span> 
            ) : (
              null
            )
            }           */}
                      
            <img
               src={opsMxLogo}
              alt="logo"
              width="70px"
            ></img>
          </div>          
          <table className="table">
            <thead>
              <tr>
                <th>Result</th>
                <th>Report</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className={'scoreSmall ' + getClasses()}>{props.stage.outputs.overallScore}</span>
                </td>
                <td>
                  {props.stage.outputs.verificationUrl != undefined || props.stage.outputs.canaryReportURL != undefined ? (
                    <span className={'clikable scoreSmall ' + getClasses()} onClick={setModalIsOpenToTrue}>View Report</span> 
                  ) : (
                    null
                  )
                  }
                  <Modal id="verification-exe-modal" isOpen={modalIsOpen} className="modal-popup-verification modal-dialog" overlayClassName="react-modal-custom">
                    <div className="modal-content">
                      <div className="modal-header">                                    
                        <button onClick={setModalIsOpenToFalse} className="close">
                          <span>x</span>
                        </button>
                        <h4 className="modal-title">Verification Details</h4>
                      </div>                                      
                      <div className="grid-span-4 modal-body">
                      <iframe id="templateFrame" src={props.stage.outputs.verificationUrl != undefined ? props.stage.outputs.verificationUrl : canaryUrl} title="ISD">
                      </iframe>
                      </div>                    
                    </div>
                  </Modal>
                </td>                
                <td>{new Date(props.stage.endTime).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          {exceptionDiv}
        </div>
      ) : props.stage.status!= undefined && props.stage.status == 'RUNNING' &&  props.stage.outputs.verificationUrl != undefined ? (
        <div>
          <div className="detailpagelogo">
            <span className={'clikable score ' + getClasses()} onClick={setModalIsOpenToTrue}>View Report</span> 
            <Modal id="verification-exe-modal" isOpen={modalIsOpen} className="modal-popup-verification modal-dialog" overlayClassName="react-modal-custom">
              <div className="modal-content">
                <div className="modal-header">                      
                  <button onClick={setModalIsOpenToFalse} className="close">
                    <span>x</span>
                  </button>
                  <h4 className="modal-title">Verification Details</h4>
                </div>                                      
                <div className="grid-span-4 modal-body">
                <iframe id="templateFrame" src={props.stage.outputs.verificationUrl} title="ISD">
                </iframe>
                </div>                    
              </div>
            </Modal>          
            <img
               src={opsMxLogo}
              alt="logo"
              width="70px"
            ></img>
          </div>
        </div>
      ):(
        <>
          {' '}
          <img
            src={opsMxLogo}
            alt="logo"
            width="80px"
            style={{ float: 'right', marginBottom: '10px' }}
          ></img>
          <StageFailureMessage stage={props.stage} message={props.stage.failureMessage} />
        </>
      )}      
    </ExecutionDetailsSection>
  );
}

// The title here will be used as the tab name inside the
// pipeline stage execution view. Camel case will be mapped
// to space-delimited text: randomWait -> Random Wait.
export namespace VerificationExecutionDetails {
  export const title = 'verification';
}
