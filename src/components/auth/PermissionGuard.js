// components/PermissionGuard.js
import { useAuth } from "../../context/AuthContext";

const PermissionGuard = ({ permission, children }) => {
  const { permissions } = useAuth();
  if (permissions.includes(permission)) {
    return children;
  }
  return null;
};

export default PermissionGuard;
