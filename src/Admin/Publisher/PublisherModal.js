import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { endpointUser, postwithAuth, putWithAuth } from '../../components/HttpUtils';
import validator from 'validator';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

toast.configure();
const ModalForm = (props) => {
    const {
        buttonLabel,
        className,
        title,
        color,
        publisherId,
        publisherName,
        address,
        phoneNumber,
        getResultInModal,
        insertable
    } = props;

    const [id, setId] = useState(publisherId)
    const [name, setName] = useState(publisherName)
    const [addressInModal, setAddressInModal] = useState(address)
    const [phoneNumberInModal, setPhoneNumberInModal] = useState(phoneNumber)

    const [modal, setModal] = useState(false);
    const [errors, setErrors] = useState({});

    const toggle = () => setModal(!modal);

    const updatePublisher = (e) => {
        e.preventDefault();
        // toggle();

        if (!validateForm(name, addressInModal, phoneNumberInModal))
            return;

        let publisherBody = { publisherId: id, publisherName: name.trim(), address: addressInModal, phoneNumber: phoneNumberInModal };
        if (addressInModal !== null && addressInModal !== '') {
            publisherBody['address'] = addressInModal.trim();
        }
        if (phoneNumberInModal !== null && phoneNumber !== '') {
            publisherBody['phoneNumber'] = phoneNumberInModal.trim();
        }

        console.log("Publisher body: " + JSON.stringify(publisherBody));

        if (insertable) {
            postwithAuth(endpointUser + "/publishers", publisherBody).then((response) => {
                if (response.status === 200 || response.status === 201) {
                    console.log("Insert new publisher successfully!");

                    toast.success("Insert new publisher successfully!", {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 2000,
                    });

                    setTimeout(function () {
                        window.location.replace("http://localhost:3000/admin/publishers");
                    }, 2000);
                    getResultInModal(true);
                }
            }).catch(error => {
                toast.error("Insert new publisher failed!" + error.response.data.message, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 2000,
                });
                console.log("error inserting new publisher: " + error);
                getResultInModal(false);
            })
        }
        else {
            putWithAuth(endpointUser + "/publishers/" + id, publisherBody).then((response) => {
                if (response.status === 200) {
                    console.log("Update publisher successfully!");

                    toast.success("Update publisher successfully!", {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 2000,
                    });

                    setTimeout(function () {
                        window.location.replace("http://localhost:3000/admin/publishers");
                    }, 2000);
                    getResultInModal(true);
                }
            }).catch(error => {
                alert();
                toast.error("Update publisher failed!" + error.response.data.message, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 2000,
                });
                console.log("error updating publisher: " + error);
                getResultInModal(false);
            })
        }
    }

    const validateForm = (inp_name, inp_address, inp_phoneNumber) => {
        let errors = {}, formIsValid = true;
        if (inp_name.length < 5 || inp_name.length > 50) {
            errors["name"] = "Length of publisher name is in range of 5 to 50";
            formIsValid = false;
        }
        else if (inp_address !== "" && (inp_address.length < 5 || inp_address.length > 50)) {
            errors["address"] = "Length of publisher address is in range of 5 to 50";
            formIsValid = false;
        }
        else if ((inp_phoneNumber !== "" && inp_phoneNumber !== null) && (inp_phoneNumber.length < 8 || inp_phoneNumber.length > 14)) {
            errors["phoneNumber"] = "Length of phone number is in range of 8 to 14";
            formIsValid = false;
        }
        else if ((inp_phoneNumber !== "" && inp_phoneNumber !== null) && !validator.isMobilePhone(inp_phoneNumber)) {
            errors["phoneNumber"] = "Invalid phone number format!";
            formIsValid = false;
        }
        setErrors(errors);

        return formIsValid;
    }

    const renderPublisherIdField = () => {
        if (!props.insertable) {
            return (
                <FormGroup>
                    <Label for="publisherId">ID</Label>
                    <Input style={{ width: "20rem" }} type="text" name="publisherId" value={id} readOnly={true}
                        id="publisherId" placeholder="Enter publisher ID" onChange={e => setId(e.target.value)} />
                </FormGroup>
            );
        }
    }

    return (
        <div>
            <Button color={color} onClick={toggle}>{buttonLabel}</Button>
            <Modal isOpen={modal} toggle={toggle} className={className}>
                <ModalHeader toggle={toggle}>{title}</ModalHeader>
                <ModalBody>
                    <Form onSubmit={(e) => this.updateAuthor(e)}>
                        {renderPublisherIdField()}
                        <FormGroup>
                            <Label for="publisherName">Name</Label>
                            <Input style={{ width: "20rem" }} type="publisherName" name="publisherName" value={name} required
                                id="publisherName" placeholder="Enter publisher name" maxLength="50"
                                onChange={e => setName(e.target.value)} />
                            <span style={{ color: "red" }}>{errors["name"]}</span>
                        </FormGroup>
                        <FormGroup>
                            <Label for="address">Address</Label>
                            <Input style={{ width: "20rem" }} type="address" name="address" value={addressInModal} maxLength="50"
                                id="address" placeholder="Enter address" onChange={e => setAddressInModal(e.target.value)} />
                            <span style={{ color: "red" }}>{errors["address"]}</span>
                        </FormGroup>
                        <FormGroup>
                            <Label for="phoneNumber">Phone Number</Label>
                            <Input style={{ width: "20rem" }} type="phoneNumber" name="phoneNumber" value={phoneNumberInModal} maxLength="14"
                                id="phoneNumber" placeholder="Enter phoneNumber" onChange={e => setPhoneNumberInModal(e.target.value)} />
                            <span style={{ color: "red" }}>{errors["phoneNumber"]}</span>
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={updatePublisher}>OK</Button>
                    <Button color="secondary" onClick={toggle}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default ModalForm;