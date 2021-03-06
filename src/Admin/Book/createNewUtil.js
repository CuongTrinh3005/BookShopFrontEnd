import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText, Col, Row, CustomInput } from 'reactstrap';
import { endpointPublic, get, getWithAuth, endpointUser, postwithAuth, hostFrontend } from '../../components/HttpUtils';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { messages } from '../../components/message';
import CateModal from '../Category/CateModal';
import AuthorModal from '../Author/AuthorModal';
import PublisherModal from '../Publisher/PublisherModal';

toast.configure();
const BookGenerator = () => {
    const [authorList, setAuthorList] = useState([]);
    const [publisherList, setPublisherList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [checkedAuthorId, setCheckedAuthorId] = useState([]);
    const [image, setImage] = useState(null);
    const [checkboxAvailableChecked, setCheckboxAvailableChecked] = useState(true);
    const [checkboxSpecialChecked, setCheckboxSpecialChecked] = useState(false);
    const [base64Str, setBase64Str] = useState("");
    const [book, setBook] = useState({});
    const [errors, setErrors] = useState({});
    const [description, setDescription] = useState("")
    const [specification, setSpecification] = useState("");
    const [resultCateModal, setResultCateModal] = useState(false);
    const [resultAuthorModal, setResultAuthorModal] = useState(false);
    const [resultPublisherModal, setResultPublisherModal] = useState(false);

    const fecthAllPublishers = () => {
        getWithAuth(endpointUser + "/publishers").then((response) => {
            if (response.status === 200) {
                setPublisherList(response.data);
            }
        }).catch((error) => console.log("Fetching publishers error: " + error))
    }

    const fecthAllAuthors = () => {
        getWithAuth(endpointUser + "/authors").then((response) => {
            if (response.status === 200) {
                setAuthorList(response.data);
            }
        }).catch((error) => console.log("Fetching authors error: " + error))
    }

    const fetchCategories = () => {
        get(endpointPublic + "/categories").then((response) => {
            if (response.status === 200) {
                setCategoryList(response.data);
            }
        })
    }


    useEffect(() => {
        fecthAllPublishers();
        fecthAllAuthors();
        fetchCategories();

        if (resultCateModal === true)
            fetchCategories();

        if (resultAuthorModal === true)
            fecthAllAuthors()

        if (resultPublisherModal === true)
            fecthAllPublishers()
    }, [resultCateModal, resultAuthorModal, resultPublisherModal]);

    const handleCheckboxChange = (event) => {
        let options = [], option;
        for (let i = 0, len = event.target.options.length; i < len; i++) {
            option = event.target.options[i];
            if (option.selected) {
                options.push(option.value);
            }
        }
        setCheckedAuthorId(options);
    }

    const createNewBook = (e) => {
        e.preventDefault();
        if (!validateForm(e.target.bookName.value.trim(), e.target.unitPrice.value,
            checkedAuthorId.length))
            return;

        const bookBody = {
            "bookName": e.target.bookName.value.trim(),
            "unitPrice": e.target.unitPrice.value,
            "quantity": e.target.quantity.value,
            "discount": e.target.discount.value,
            "photo": getByteaFromBase64Str(base64Str),
            "description": description,
            "specification": specification,
            "viewCount": e.target.viewCount.value,
            "special": checkboxSpecialChecked,
            "available": checkboxAvailableChecked,
            "categoryName": e.target.category.value,
            "publisherName": e.target.publisher.value,
            "authorIds": checkedAuthorId
        }
        console.log(bookBody);
        setBook(bookBody);

        postwithAuth(endpointUser + "/books", bookBody).then((response) => {
            if (response.status === 200 || response.status === 201) {
                console.log(messages.insertSuccess);
                toast.success(messages.insertSuccess, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 2000,
                });

                setTimeout(function () {
                    window.location.replace(hostFrontend + "admin/books");
                }, 2000);
            }
        }).catch(error => {
            toast.error(messages.insertFailed, {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 2000,
            });
            console.log("error inserting new book: " + error);
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        })
    }

    const getByteaFromBase64Str = () => {
        if (base64Str !== "") {
            const byteArr = base64Str.split(",");
            return byteArr[1];
        }
    }

    const onImageChange = event => {
        if (event.target.files && event.target.files[0]) {
            let img = event.target.files[0];
            setImage(URL.createObjectURL(img))
            getBase64(event.target.files[0], (result) => {
                setBase64Str(result);
            });
        }
    };

    const handleAvailableChange = (event) => {
        setCheckboxAvailableChecked(event.target.checked)
    }

    const handleSpecialChange = (event) => {
        setCheckboxSpecialChecked(event.target.checked);
    }

    const getBase64 = (file, cb) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            cb(reader.result)
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    const validateForm = (name, price, authorsLength) => {
        let errors = {}, formIsValid = true;
        if (name.length < 6 || name.length > 250) {
            errors["name"] = messages.bookNameLength;
            formIsValid = false;
        }
        if (price < 1000) {
            errors["price"] = messages.bookPrice;
            formIsValid = false;
        }
        if (authorsLength === 0) {
            errors["authors"] = messages.selectAuthor;
            formIsValid = false;
        }
        setErrors(errors);

        return formIsValid;
    }

    const getResultInCateModal = (result) => {
        setResultCateModal(result);
    }

    const getResultInAuthorModal = (result) => {
        setResultAuthorModal(result);
    }

    const getResultInPublisherModal = (result) => {
        setResultPublisherModal(result);
    }

    return (
        <div>
            <h2>TH??M M???I D??? LI???U S??CH</h2>
            <Form style={{ marginTop: "2.5rem" }} onSubmit={(e) => createNewBook(e)}>
                <Row>
                    <Col sm="6">
                        <FormGroup>
                            <Label for="bookName">T??n s??ch</Label>
                            <Input type="text" name="bookName" id="bookName" placeholder="T??n s??ch" required />
                            <span style={{ color: "red" }}>{errors["name"]}</span>
                        </FormGroup>
                    </Col>

                    <Col sm="2">
                        <FormGroup>
                            <Label for="unitPrice">????n gi??</Label>
                            <Input type="number" step="0.01" name="unitPrice" required
                                id="unitPrice" placeholder="????n gi??" min="1000" defaultValue="1000" />
                            <span style={{ color: "red" }}>{errors["price"]}</span>
                        </FormGroup>
                    </Col>
                    <Col sm="2">
                        <FormGroup>
                            <Label for="discount">Gi???m gi??</Label>
                            <Input type="number" step="0.001" name="discount" id="discount" placeholder="Gi???m gi??" min="0" max="1" defaultValue="0" />
                        </FormGroup>
                    </Col>
                    <Col sm="2">
                        <FormGroup>
                            <Label for="quantity">S??? l?????ng</Label>
                            <Input type="number" name="quantity" id="quantity" placeholder="S??? l?????ng" min="1" defaultValue="1" />
                        </FormGroup>
                    </Col>
                </Row>

                <Row>
                    <Col sm="9">
                        <FormGroup>
                            <Label for="categorySelect">Ch???n th??? lo???i s??ch</Label>
                            <Input type="select" name="category" id="categorySelect">
                                {categoryList.map((cate) => (
                                    <option key={cate.categoryId}>{cate.categoryName}</option>
                                ))}
                            </Input>
                        </FormGroup>
                    </Col>

                    <Col sm="3" style={{ marginTop: "1rem" }}>
                        <CateModal
                            buttonLabel="Th??m m???i th??? lo???i"
                            className="insert-button"
                            title="Th??m m???i th??? lo???i"
                            color="success"
                            categoryId=""
                            categoryName=""
                            description=""
                            getResultInModal={getResultInCateModal}
                            insertable={true}
                            external={true}>
                            Th??m m???i th??? lo???i</CateModal>

                    </Col>
                </Row>

                <Row>
                    <Col sm="9">
                        <FormGroup>
                            <Label for="publisherSelect">Ch???n nh?? xu???t b???n</Label>
                            <Input type="select" name="publisher" id="publisherSelect">
                                {publisherList.map((pub) => (
                                    <option key={pub.publisherId}>{pub.publisherName}</option>
                                ))}
                            </Input>
                        </FormGroup>
                    </Col>

                    <Col sm="3" style={{ marginTop: "1.2rem" }}>
                        <PublisherModal
                            buttonLabel="Th??m m???i nh?? XB "
                            className="insert-button"
                            title="Th??m m???i nh?? xu???t b???n"
                            color="success"
                            publisherId=""
                            publisherName=""
                            address=""
                            phoneNumber=""
                            getResultInModal={getResultInPublisherModal}
                            insertable={true}
                            external={true}>
                            Th??m m???i nh?? xu???t b???n</PublisherModal>
                    </Col>
                </Row>

                <Row>
                    <Col sm="9">
                        <FormGroup>
                            <Label for="authorSelectMulti">Ch???n t??c gi???</Label>
                            <Input type="select" name="authors" multiple id="authorSelectMulti" onChange={(event) => { handleCheckboxChange(event) }}>
                                {authorList.map((author) => (
                                    <option key={author.authorId} value={author.authorId}>{author.authorName}</option>
                                ))}
                            </Input>
                            <span style={{ color: "red" }}>{errors["authors"]}</span>
                        </FormGroup>
                    </Col>

                    <Col sm="3" style={{ marginTop: "2rem" }}>
                        <AuthorModal
                            buttonLabel="Th??m m???i t??c gi???"
                            className="insert-button"
                            title="Th??m m???i t??c gi???"
                            color="success"
                            authorId=""
                            authorName=""
                            address=""
                            phoneNumber=""
                            getResultInModal={getResultInAuthorModal}
                            insertable={true}
                            external={true}>
                            Th??m m???i t??c gi???</AuthorModal>
                    </Col>
                </Row>

                <Row>
                    <Col sm="2">
                        <Label for="viewCount">L?????t xem</Label>
                        <Input type="number" name="viewCount" id="viewCount" placeholder="Unit price" min="0" defaultValue="0" />
                    </Col>

                    <Col sm="2">
                        <Label for="available">T??nh tr???ng t???t</Label>
                        <div>
                            <CustomInput type="checkbox" id="availableCheckbox" label="Available" name="available" defaultChecked={checkboxAvailableChecked}
                                checked={checkboxAvailableChecked} onChange={(e) => handleAvailableChange(e)} />
                        </div>
                    </Col>

                    <Col sm="2">
                        <Label for="special">H??ng ?????c bi???t</Label>
                        <div>
                            <CustomInput type="checkbox" name="special" id="specialCheckbox" label="special" defaultChecked={checkboxSpecialChecked}
                                checked={checkboxSpecialChecked} onChange={(e) => handleSpecialChange(e)}
                            />
                        </div>
                    </Col>
                </Row>

                <FormGroup>
                    <Label for="description">M?? t???</Label>
                    <CKEditor id="description"
                        editor={ClassicEditor}
                        data={description}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setDescription(data);
                        }}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="specification">Th??ng s??? k??? thu???t</Label>
                    <CKEditor id="specification"
                        editor={ClassicEditor}
                        data={specification}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setSpecification(data);
                        }}
                    />
                </FormGroup>

                <br />
                <FormGroup>
                    <Label for="photoFile">???nh</Label>
                    <Input type="file" name="photo" id="photoFile" accept="image/*" onChange={(e) => onImageChange(e)} />
                    <FormText color="muted">
                        Upload ???nh
                    </FormText>
                    <img src={image} alt="No image" width="200" height="100" />
                </FormGroup>

                <Button style={{ marginTop: "2rem" }} color="primary">TH??M M???I</Button>
            </Form>
        </div>
    );
}

export default BookGenerator;