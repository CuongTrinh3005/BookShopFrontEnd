import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { endpointUser, hostFrontend, postwithAuth, putWithAuth } from '../../components/HttpUtils';
import validator from 'validator';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { messages } from '../../components/message';

toast.configure();
const AuthorModal = (props) => {
    const {
        buttonLabel,
        className,
        title,
        color,
        authorId,
        authorName,
        address,
        phoneNumber,
        getResultInModal,
        insertable,
        external
    } = props;

    const [id, setId] = useState(authorId)
    const [name, setName] = useState(authorName)
    const [addressInModal, setAddressInModal] = useState(address)
    const [phoneNumberInModal, setPhoneNumberInModal] = useState(phoneNumber)
    const [useExternal] = useState(external);

    const [modal, setModal] = useState(false);
    const [errors, setErrors] = useState({});

    const toggle = () => setModal(!modal);

    const updateAuthor = (e) => {
        e.preventDefault();
        // toggle();

        if (!validateForm(name, addressInModal, phoneNumberInModal))
            return;
        const authorBody = { authorId: id, authorName: name.trim(), address: addressInModal, phoneNumber: phoneNumberInModal }
        if (addressInModal !== null && addressInModal !== '') {
            authorBody['address'] = addressInModal.trim();
        }
        if (phoneNumberInModal !== null && phoneNumber !== '') {
            authorBody['phoneNumber'] = phoneNumberInModal.trim();
        }

        console.log("Author body: " + JSON.stringify(authorBody));

        if (insertable) {
            postwithAuth(endpointUser + "/authors", authorBody).then((response) => {
                if (response.status === 200 || response.status === 201) {
                    console.log("Insert new author successfully!");
                    toast.success(messages.insertSuccess, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 2000,
                    });

                    if (useExternal === false) {
                        setTimeout(function () {
                            window.location.replace(hostFrontend + "admin/authors");
                        }, 2000);
                    }

                    getResultInModal(true);
                    toggle();
                }
            }).catch(error => {
                toast.error(messages.insertFailed + " Vui l??ng ki???m tra ???????ng truy???n!", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 2000,
                });
                console.log("error inserting new author: " + error);
                getResultInModal(false);
            })
        }
        else {
            putWithAuth(endpointUser + "/authors/" + id, authorBody).then((response) => {
                if (response.status === 200) {
                    console.log("Update author successfully!");

                    toast.success(messages.updateSuccess, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 2000,
                    });

                    if (useExternal === false) {
                        setTimeout(function () {
                            window.location.replace(hostFrontend + "admin/authors");
                        }, 2000);
                    }

                    getResultInModal(true);
                    toggle();
                }
            }).catch(error => {
                toast.error(messages.insertFailed + " Vui l??ng ki???m tra ???????ng truy???n!", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 2000,
                });
                console.log("error updating author: " + error);
                getResultInModal(false);
            })
        }
    }

    const validateForm = (inp_name, inp_address, inp_phoneNumber) => {
        let errors = {}, formIsValid = true;
        if (inp_name.length < 5 || inp_name.length > 50) {
            errors["name"] = messages.author_PublisherNameLength;
            formIsValid = false;
        }
        else if (inp_address !== "" && (inp_address.length < 5 || inp_address.length > 50)) {
            errors["address"] = messages.addressLength;
            formIsValid = false;
        }
        else if ((inp_phoneNumber !== "" && inp_phoneNumber !== null) && (inp_phoneNumber.length < 8 || inp_phoneNumber.length > 14)) {
            errors["phoneNumber"] = messages.phoneNumberLength;
            formIsValid = false;
        }
        else if ((inp_phoneNumber !== "" && inp_phoneNumber !== null) && !validator.isMobilePhone(inp_phoneNumber)) {
            errors["phoneNumber"] = messages.invalidPhoneNumberFormat;
            formIsValid = false;
        }
        setErrors(errors);

        return formIsValid;
    }

    const renderAuthorIdField = () => {
        if (!props.insertable) {
            return (
                <FormGroup>
                    <Label for="authorId">ID</Label>
                    <Input style={{ width: "20rem" }} type="text" name="authorId" value={id} readOnly={true}
                        id="authorId" placeholder="Enter author ID" onChange={e => setId(e.target.value)} />
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
                        {renderAuthorIdField()}
                        <FormGroup>
                            <Label for="authorName">H??? t??n</Label>
                            <Input style={{ width: "20rem" }} type="authorName" name="authorName" value={name} required
                                id="authorName" placeholder="Nh???p h??? t??n" maxLength="50"
                                onChange={e => setName(e.target.value)} />
                            <span style={{ color: "red" }}>{errors["name"]}</span>
                        </FormGroup>
                        <FormGroup>
                            <Label for="address">?????a ch???</Label>
                            <Input style={{ width: "20rem" }} type="address" name="address" value={addressInModal} maxLength="50"
                                id="address" placeholder="Nh???p ?????a ch???" onChange={e => setAddressInModal(e.target.value)} />
                            <span style={{ color: "red" }}>{errors["address"]}</span>
                        </FormGroup>
                        <FormGroup>
                            <Label for="phoneNumber">S??? ??i???n tho???i</Label>
                            <Input style={{ width: "20rem" }} type="phoneNumber" name="phoneNumber" value={phoneNumberInModal} maxLength="14"
                                id="phoneNumber" placeholder="Nh???p s??? ??i???n tho???i" onChange={e => setPhoneNumberInModal(e.target.value)} />
                            <span style={{ color: "red" }}>{errors["phoneNumber"]}</span>
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={updateAuthor}>OK</Button>
                    <Button color="secondary" onClick={toggle}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default AuthorModal;