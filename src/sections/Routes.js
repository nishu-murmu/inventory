import { Routes, Route} from 'react-router-dom';
import PurchasePage from '../pages/purchasePage';
import PurchaseReturnPage from '../pages/purchaseReturnPage';
import SalesPage from '../pages/salesPage';
import SalesReturnPage from '../pages/salesReturnPage';
import LoginPage from '../pages/Auth/loginPage';
import SignUpPage from '../pages/Auth/signUpPage';
import MappedPage from '../pages/sku/mappedPage';
import UnMappedPage from '../pages/sku/unMappedPage';

const AllRoutes = () => {
    return <Routes>
    <Route path="/signUp" element={<SignUpPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path='/mapped' element={<MappedPage />}/>
    <Route path='/unmapped' element={<UnMappedPage />} />
    <Route path="/purchase" element={<PurchasePage />} />
    <Route path="/purchaseReturn" element={<PurchaseReturnPage />} />
    <Route path="/sales" element={<SalesPage />} />
    <Route path="/salesReturn" element={<SalesReturnPage />} />
  </Routes>
}

export default AllRoutes