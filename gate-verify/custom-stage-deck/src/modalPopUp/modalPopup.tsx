import React from 'react';
import { Button, Modal } from 'react-bootstrap';
//import { Spinner } from '../../../widgets/spinners/Spinner';

import './modalPopup.less';

export interface IModalPopupState {
  loading: boolean;
  url : string;
}

export interface IModalPopupProps {
  show: boolean;
  showCallback: (show: boolean) => void;
}

export class ModalPopup extends React.Component<IModalPopupProps, IModalPopupState> {
  constructor(props: IModalPopupProps) {
    super(props);
    this.state = this.getDefaultState();
  }

  private getDefaultState(): IModalPopupState {
    return {
      loading: false,
      url : ''
    };
  }

  public close = (evt?: React.MouseEvent<any>): void => {
    evt && evt.stopPropagation();
    this.setState(this.getDefaultState());
    this.props.showCallback(false);
  };

  public render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.close}
        className="sample-modal-overflow-visible"
        backdrop="static"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Sample Modal Popup</Modal.Title>
        </Modal.Header>
        {this.state.loading && (
          <Modal.Body style={{ height: '600px', width : '900px' }}>
            {/* <Spinner size="medium" /> */}
          </Modal.Body>
        )}
        {!this.state.loading && (
          <Modal.Body>
            <div className="form-group clearfix">
                <div className="col-md-12">
                  <iframe src="https://oes-master.dev.opsmx.org/ui/application" title="ISD" width="900" height="600">
                  </iframe>
                </div>
            </div>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button onClick={this.close}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
