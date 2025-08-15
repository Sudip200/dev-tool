import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { type RootState } from '../app/store';
import { checkAuth } from '../features/auth/authSlice';
import { Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  useEffect(()=>{
      
    if (!isAuthenticated) {
      dispatch(checkAuth());
    }
  }, [isAuthenticated, dispatch]);

  return isAuthenticated ? <Outlet /> : <h2>You are not authorized to view this page</h2>;
};

export default ProtectedRoute;
