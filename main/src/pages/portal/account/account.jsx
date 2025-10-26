import { useUserData } from "../../../context/userDataContext";

export function AccountPage() {
    const { userEntityData, userInfo } = useUserData();

    return (
        <div className='centered-page'>
            <h1>My Account</h1>
            <p>Name: {userEntityData.firstName} {userEntityData.lastName}</p>
            <p>Email: {userInfo.email}</p>
        </div>
    );
}
