import React, { useContext } from "react";
import styles from "./user-data-table.scss";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
    DataTable, TableContainer, TableToolbar, TableBatchActions,
    TableToolbarMenu,
    TableToolbarAction, Table, TableHead, TableRow, TableSelectAll,
    TableHeader, TableBody, TableSelectRow, TableCell, Pagination, Button
} from "carbon-components-react";
import { Edit16, Settings32, UserAccess24, WatsonHealthNominate16 } from '@carbon/icons-react';
import { SearchInput } from "../toolbar_search_container/toolbar_search_container";
import { Roles } from "./role-component";
import { UserRegistrationContext } from "../../user-context";
import { getSizeUsers, getAllUserPages, changeUserStatus, changeUserProfile, getStatusUser, checkProfile, updateUserRoles, formatRole } from "../user-form/register-form/user-ressource";
import { UserFollow32 } from "@carbon/icons-react"
import { Icon } from "@iconify/react";
import { Profiles, Status } from "../user-form/administration-types";


export interface DeathListProps {
    refresh?: boolean;
    lg?: any;
    uuid?: string;
    currentUser?: any;

}

const getFullNameWithGender = (fullName: string) => {
    const value = fullName.split('-');
    return <> <Icon className={styles.closeButton} icon={value[1] == "M" ? "emojione-monotone:man" : "emojione-monotone:woman"} /> {value[0]} </>
}

const UserDataTable: React.FC<DeathListProps> = ({ refresh, lg, uuid, currentUser }) => {
    const [rowsTable, setRows] = useState([]);
    const { colSize } = useContext(UserRegistrationContext);
    const [totalpageSize, setTotalPageSize] = useState(1);
    const [[pageSize, page], setPaginationPageSize] = useState([5, 1]);
    const paginationPageSizes = [1, 5, 10, 20, 30, 40];
    const [roles, setRoles] = useState([]);
    const [changeSelectRow, setChangeSelectRow] = useState(0)
    let { userUuid } = useContext(UserRegistrationContext);
    const [showAddUser, setShowAddUser] = useState((uuid == undefined));
    const abortController = new AbortController();
    const { t } = useTranslation();
    const headers = [
        { key: 'Username', header: t('Username') }, { key: 'fullName', header: t('fullName') }, { key: 'phone', header: t('phone') },
        { key: 'profile', header: t('profileLabel') }, { key: 'roles', header: t('roles') },
        { key: "locale", header: t("locale") }, { key: 'status', header: t('status') }, 
       // { key: 'userProperties', header: t('userProperties') }

    ];

    const checkTranslation = (text: string) => {
        switch (text) {
            case "nurse":
                return t("nurse")
            case "nurseM":
                return t("nurseM")
            case "nurseF":
                return t("nurseF")
            case "doctorM":
                return t("doctor")
            case "doctorF":
                return t("doctor")
            case "doctor":
                return t("doctor")
            case "adminM":
                return t("admin")
            case "admin":
                return t("admin")
            case "M":
                return t("maleLabel")
            case "F":
                return t("femaleLabel")
            default:
                return t(text);
        }
    }

    const formatUser = (users) => {
        return Promise.all(
            users.map(async (user) => {
                const roles = formatRole(user?.roles);
                return {
                    id: user?.uuid,
                    Username: user?.username,
                    fullName: user?.person.names[0].familyName + ", " + user?.person.names[0].givenName + "-" + user?.person.gender,
                    profile: checkProfile(user.systemId),
                    roles: roles?.length > 1 ? (roles[0].display.split(":")[1] + ", " + roles[1].display.split(":")[1] + " (" + roles?.length + ")") : roles[0]?.display.split(":")[1],
                    phone: user?.person.attributes?.find((attribute) => attribute?.display.split(" = ")[0] == "Telephone Number")?.display.split("Telephone Number = ")[1],
                    status: getStatusUser(user?.userProperties?.status, user?.retired),
                    locale: user?.userProperties,
                }
            }))
    }

    const formatRows = (rows, status) => {
        const users = rows.map(row => {
            return {
                uuid: row.id,
                userProperties: row.cells[row.cells.length - 1].value,
                username: row.cells[0].value
            }
        })
        changeUserStatus(abortController, users, status).then(() => changeRows(pageSize, page))
    }

    useEffect(function () {
        changeRows(pageSize, page ? page : 1);
        getSizeUsers(currentUser?.username).then(size => setTotalPageSize(size))
    }, [refresh]);

    const changeRows = (size, page) => {
        let start = ((page - 1) * size);
        start = start <= 1 ? 1 : start;
        setPaginationPageSize([size, page]);
        getAllUserPages(size, start, currentUser?.username)
            .then(users => formatUser(users)
                .then(data => setRows(data)))
    }
    function onclickEdit(e) {
        e.stopPropagation();
        userUuid(e.target.parentNode.id);
        colSize([7, 5]);
    }

    return (
        <DataTable rows={rowsTable} headers={headers} useZebraStyles={true} >
            {({
                rows,
                headers,
                getHeaderProps,
                getSelectionProps,
                getToolbarProps,
                getBatchActionProps,
                onInputChange,
                selectedRows,
                getTableProps,
                totalSelected,
                getTableContainerProps,
            }) => {
                const batchActionProps = getBatchActionProps();
                return (
                    <div className={styles.TableMainContainer}>
                        <h4 className={styles.tableTitle}>{t("tableTitle", "Liste des utilisateurs")}</h4>
                        <TableContainer  {...getTableContainerProps()} >
                            <div className={styles.TableContainer}>
                                <TableToolbar {...getToolbarProps()} >
                                    <div id={styles["toolbar-content"]} className={"bx--toolbar-content"}>
                                        <SearchInput
                                            className={styles['search-1']}
                                            onChange={(e) => ((e.currentTarget.value.trim().length) > 0) && onInputChange(e)} />
                                        {
                                            (showAddUser || uuid || (lg[1] == 0)) &&
                                            <Button
                                                hasIconOnly
                                                renderIcon={UserFollow32}
                                                onClick={() => {
                                                    userUuid(undefined)
                                                    colSize([7, 5])
                                                    setShowAddUser(false)
                                                }}
                                                className={styles.Button}
                                            />
                                        }

                                    </div>
                                    <TableBatchActions
                                        className={styles.TableBatchActions}
                                        {...batchActionProps}
                                    >
                                        <TableToolbarMenu
                                            renderIcon={WatsonHealthNominate16}
                                            iconDescription={t("profileLabel")}
                                            tabIndex={batchActionProps.shouldShowBatchActions ? -1 : 0}>
                                            <TableToolbarAction className={styles.TableToolbarMenu}>
                                                <Roles
                                                    placeholder={t("roles")}
                                                    onChange={(data) => { setRoles(data); }}
                                                    updateRoles={(roles) => updateUserRoles(abortController, selectedRows, roles).then(() => changeRows(pageSize, page))}
                                                />
                                            </TableToolbarAction>
                                        </TableToolbarMenu>

                                        <TableToolbarMenu
                                            renderIcon={UserAccess24}
                                            iconDescription={t("profileLabel")}
                                            tabIndex={batchActionProps.shouldShowBatchActions ? -1 : 0}>
                                            {Object.values(Profiles).map((element) => {
                                                return (
                                                    <TableToolbarAction onClick={(e) => changeUserProfile(abortController, selectedRows, element).then(() => changeRows(pageSize, page))}>
                                                        {t(element)}
                                                    </TableToolbarAction>
                                                )
                                            })}
                                        </TableToolbarMenu>
                                        <TableToolbarMenu
                                            renderIcon={Settings32}
                                            iconDescription={t("status")}
                                            tabIndex={batchActionProps.shouldShowBatchActions ? -1 : 0}>
                                            {Object.values(Status).map((s) => {
                                                return (
                                                    <TableToolbarAction onClick={(e) => formatRows(selectedRows, s)}>
                                                        {t(s == "waiting" ? "reset" : s)}
                                                    </TableToolbarAction>
                                                )
                                            })}
                                        </TableToolbarMenu>
                                    </TableBatchActions>
                                </TableToolbar>
                            </div>
                            <Table {...getTableProps()} size='lg'>
                                <TableHead className={styles.TableRowHeader}>
                                    <TableRow>
                                        <TableSelectAll
                                            onSelect={(e) => colSize([12, 0])}
                                            {...getSelectionProps()}
                                        />
                                        {headers.map((header) => (
                                            (header.key !== "uuid") &&
                                            <TableHeader key={header.uuid} {...getHeaderProps({ header, isSortable: true })}>
                                                {header.header}
                                            </TableHeader>
                                        ))}
                                        <Edit16 className={styles.editHeader} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow id={row.id} key={row.id}  >
                                            <TableSelectRow
                                                className={styles.testRows}
                                                {...getSelectionProps({ row })}
                                                onChange={(e) => colSize([12, 0])}
                                            />
                                            {row.cells.map((cell, i) => <TableCell key={cell.id}>
                                                {i > 2 ? checkTranslation(cell.value) : (i == 1 ? getFullNameWithGender(cell.value) : cell.value)}
                                            </TableCell>
                                            )}
                                            <UserRegistrationContext.Provider value={{ uuid: undefined, colSize: undefined, userUuid: undefined, setRefresh: undefined, selectedRow: changeSelectRow }}>

                                                <Edit16 className={styles.editRow} onClick={onclickEdit} />
                                            </UserRegistrationContext.Provider>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Pagination
                            className={styles.page}
                            backwardText={t("PreviousPage")}
                            forwardText={t("NextPage")}
                            itemsPerPageText={t("Show")}
                            onChange={e => changeRows(e.pageSize, e.page)}
                            page={page}
                            pageSize={pageSize}
                            pageSizes={paginationPageSizes}
                            size="sm"
                            totalItems={totalpageSize}
                        />
                    </div>
                );
            }}
        </DataTable >
    );
}

export default UserDataTable;

