import React, { useEffect, useState } from 'react';
import { deleteWithAuth, endpointUser, getWithAuth, hostBackend } from '../../components/HttpUtils';
import { Container, Row, Col } from 'reactstrap';
import Pagination from '../../components/Pagination';
import ModalForm from './UserModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RiCloseCircleLine } from 'react-icons/ri'
import { messages } from '../../components/message';

toast.configure();
const UserManagement = () => {
    const [userList, setUserList] = useState([]);
    const [result, setResult] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage] = useState(5);
    const [deleted, setDeleted] = useState(false);
    const [query, setQuery] = useState("");

    const fetchAllUsers = () => {
        getWithAuth(endpointUser + "/admin/users").then((response) => {
            if (response.status === 200) {
                setUserList(response.data);
            }
        }).catch((error) => console.log("Fetching users error: " + error))
    }

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const getResultInModal = (resultModal) => {
        setResult(resultModal);
    }

    const deleteUser = (username) => {
        if (window.confirm(messages.deleteConfirm)) {
            deleteWithAuth(hostBackend + "api/v1/admin/users/" + username).then((response) => {
                if (response.status === 200) {
                    setDeleted(true);
                    // remove in list locally
                    const index = userList.map(function (item) {
                        return item.username
                    }).indexOf(username);
                    userList.splice(index, 1);

                    // rerender DOM
                    var deletedRow = document.getElementById("row-" + username);
                    document.getElementById("table-body").removeChild(deletedRow);

                    // document.getElementById("row-" + username).remove();
                    toast.success(messages.deleteSuccess, {
                        position: toast.POSITION.TOP_CENTER,
                        autoClose: 1000,
                    });
                }
            }).catch(error => {
                if (error.response) {
                    toast.error(messages.deleteFailed + " Kh??ng ???????c x??a user c?? ????n h??ng hay ????nh gi?? s???n ph???m", {
                        position: toast.POSITION.TOP_CENTER,
                        autoClose: 1000,
                    });
                }
                console.log("Delete user error: " + error);
            })
        } else {
            // Do nothing!
        }
    }

    var currentList = [];
    if (query !== '') {
        currentList = userList.filter((user) => user['username'].toString().includes(query)
            || user['fullName'].toLowerCase().includes(query) || user['email'].toLowerCase().includes(query));
    }
    else {
        const indexOfLastItem = currentPage * itemPerPage;
        const indexOfFirstItem = indexOfLastItem - itemPerPage;
        currentList = userList.slice(indexOfFirstItem, indexOfLastItem);
    }

    const paginate = (pageNumber) => {
        try {
            if (deleted === true) {
                toast.info(messages.updateAfterDeleted, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 2000,
                });

                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            }
            setCurrentPage(pageNumber)
        }
        catch (error) {
            console.log("Pagination error: " + error);
        }
    }

    const onSearching = (event) => {
        if (deleted === true) {
            toast.info(messages.updateAfterDeleted, {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 2000,
            });

            setTimeout(function () {
                window.location.reload();
            }, 2000);
        }

        let query = event.target.value.toLowerCase().trim();
        setQuery(query);
    }

    return (
        <div>
            <Container>
                <Row style={{ marginTop: "2rem" }}>
                    <h3 className="alert alert-warning" align="center" style={{ width: "100%" }}>QU???N L?? NG?????I D??NG</h3>
                    <Col sm="9" >
                        <input type="search"
                            style={{ width: "15rem" }} placeholder="Nh???p username, h??? t??n, email..."
                            onChange={onSearching} />
                    </Col>
                    <Col >
                        <ModalForm style={{ marginTop: "1rem" }, { marginLeft: "7rem" }}
                            buttonLabel="Th??m m???i ng?????i d??ng"
                            className="insert-button"
                            title="Th??m m???i ng?????i d??ng"
                            color="success"
                            username=""
                            fullname=""
                            emailInput=""
                            phoneNumberInput=""
                            addressInput=""
                            genderInput={null}
                            imageInput={null}
                            roleInput=""
                            getResultInModal={() => getResultInModal()}
                            insertable={true}
                            deleted={deleted}>
                            Th??m m???i ng?????i d??ng</ModalForm>
                    </Col>
                </Row>

                <Row style={{ marginTop: "2rem" }}>
                    <Col>
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <td>???nh</td>
                                    <th>H??? t??n</th>
                                    <th>ROLE</th>
                                    <th>Email</th>
                                    <th>Gi???i t??nh</th>
                                    <th>S??T</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody id="table-body">
                                {currentList.map((user) => (
                                    <tr key={user.username} id={"row-" + user.username}>
                                        <td>{user.username}</td>
                                        <td>
                                            {(user.photo !== null) ?
                                                <img src={`data:image/jpeg;base64,${user.photo}`}
                                                    alt="No image" height="150" width="100">
                                                </img>
                                                :
                                                <img src={window.location.origin + '/user-default.jpg'}
                                                    alt="No image" height="100" width="100">
                                                </img>
                                            }

                                        </td>
                                        <td>{user.fullName}</td>
                                        <td>{user.roles.trim().replace(" ", ", ")}</td>
                                        <td>{user.email}</td>
                                        {user.gender === null ? <td></td> : user.gender === true ? <td>MALE</td> : <td>FEMALE</td>}
                                        <td>{user.phoneNumber}</td>
                                        <td><ModalForm
                                            buttonLabel="S???a"
                                            className="edit"
                                            title="S???a"
                                            color="info"
                                            username={user.username}
                                            fullname={user.fullName}
                                            emailInput={user.email}
                                            phoneNumberInput={user.phoneNumber}
                                            addressInput={user.address}
                                            genderInput={user.gender}
                                            imageInput={user.photo}
                                            roleInput={user.roles}
                                            getResultInModal={() => getResultInModal()}
                                            insertable={false}
                                            deleted={deleted}>
                                        </ModalForm></td>
                                        <td>
                                            <RiCloseCircleLine color="red" onClick={() => deleteUser(user.username)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Col>
                    {query === '' && <Pagination itemPerPage={itemPerPage} totalItems={userList.length} paginate={paginate} />}
                </Row>
            </Container>
        </div>
    );
}

export default UserManagement;