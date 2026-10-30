import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/product/ProductsPage";
import OrdersPage from "./pages/order/OrdersPage";
import CustomersPage from "./pages/customer/CustomersPage";
import CouponsPage from "./pages/coupons/CouponsPage";
import ReviewsPage from "./pages/review/ReviewsPage";
import ContentPage from "./pages/ContentPage";
// import StaffPage from "./pages/StaffPage";
import ReportsPage from "./pages/report/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NewUser from "./pages/users/NewUser";
import MainUsersPage from "./pages/users/MainUsersPage";
import EditUserPage from "./pages/users/EditUser";
import ProductManagementForm from "./pages/product/productadd/ProductManagementForm";
import ProductManagementFormEdit from "./pages/product/productedit/ProductManagementFormEdit";
// import ProductForm from "./pages/ProductForm";
import HeadCategoriesPage from "./pages/product category/headcategory/HeadCategories";
import ParentCategoriesPage from "./pages/product category/parentcategory/ParentCategories";
import ChildCategoriesPage from "./pages/product category/childcategory/ChildCategories";
import ProductTagsPage from "./pages/tags/ProductTags";
import DiscountPage from "./pages/discount/DiscountPage";
import BrandsPage from "./pages/brands/BrandPage";
import PermissionSettingsPage from "./pages/permission/PermissionSettings";

import ViewUser from "./pages/users/ViewUserModal";

import ColorsTable from "./pages/color/UserColorTable";
import AddColor from "./pages/color/AddColor";
import EditColor from "./pages/color/EditColor";
import SizesTable from "./pages/sizes/SizesTable";
import AddSize from "./pages/sizes/AddSize";
import EditSize from "./pages/sizes/EditSize";
import EditDiscountPage from "./pages/discount/EditDiscountPage";
import DiscountViewModal from "./pages/discount/DiscountViewModal";
import AddDiscountPage from "./pages/discount/AddDiscount";
import AddProductTagPage from "./pages/tags/AddProductTagPage";
import EditProductTagPage from "./pages/tags/EditProductTagPage";
import AddHeadCategoryPage from "./pages/product category/headcategory/AddHeadCategory";
import EditHeadCategoryPage from "./pages/product category/headcategory/EditHeadCategoryPage";
import HeadCategoriesTable from "./pages/product category/headcategory/HeadCategoriesTable";
import AddParentCategory from "./pages/product category/parentcategory/AddParentCategory";
import EditParentCategory from "./pages/product category/parentcategory/EditParentCategory";
import AddChildCategory from "./pages/product category/childcategory/AddChildCategory";
import EditChildCategoryPage from "./pages/product category/childcategory/EditChildCategoryPage";
import AddBrandPage from "./pages/brands/AddBrandPage";
import EditBrandPage from "./pages/brands/EditBrandPage";
import UploadBrandPage from "./pages/brands/UploadBrandPage";
import SeasonTable from "./pages/season/SeasonTable";
import AddSeason from "./pages/season/AddSeason";
import EditSeason from "./pages/season/EditSeason";
import FabricsPage from "./pages/fabric/FabricTable";
import AddFabric from "./pages/fabric/AddFabric";
import EditFabric from "./pages/fabric/EditFabric";
import ViewProductPage from "./pages/product/ViewProductPage";
import OrderDetailsPage from "./pages/order/OrderDetailsPage";
import OrderEditPage from "./pages/order/OrderEditPage";
import EditCouponPage from "./pages/coupons/EditCoupon";
import AddCouponPage from "./pages/coupons/AddCoupons";
import AddRoles from "./pages/role/AddRoles";
import EditRole from "./pages/role/EditRoles";
import RoleTable from "./pages/role/RolesTable";
import StockAlertPage from "./pages/stockalert/stockalert";
import AddBannerPage from "./components/content/Banner/AddBannerPage";
import BannerFormPage from "./components/content/Banner/BannerFormPage";
import AddSliderPage from "./components/content/Slider/AddSliderPage";
import EditSliderPage from "./components/content/Slider/EditSliderPage";
import AddBlogPage from "./components/content/Blog/AddBlogPage";
import EditBlogPage from "./components/content/Blog/EditBlogPage";
import EditCustomerPage from "./pages/customer/CustomersEditPage";
import NotificationsPage from "./pages/NotificationsPage.js";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import SubscribersTable from "./pages/subscriber/Subscriber.js";
import BlogCommentsTable from "./pages/blogcomment/BlogComment.js";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/signup" element={<SignupPage />} />
                <Route
                  path="/auth/forgotpassword"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/orders" element={<OrdersPage />} />
                          <Route
                            path="/view-orders/:id"
                            element={<OrderDetailsPage />}
                          />
                          <Route
                            path="/edit-orders/:id"
                            element={<OrderEditPage />}
                          />
                          <Route
                            path="/customers"
                            element={<CustomersPage />}
                          />
                          <Route
                            path="/customers/edit/:id"
                            element={<EditCustomerPage />}
                          />
                          {/* Coupen path */}
                          <Route path="/coupons" element={<CouponsPage />} />
                          <Route
                            path="/addcoupen"
                            element={<AddCouponPage />}
                          />
                          <Route
                            path="/view-coupons/:id"
                            element={<OrderDetailsPage />}
                          />
                          <Route
                            path="/edit-coupons/:id"
                            element={<EditCouponPage />}
                          />
                          <Route path="/reviews" element={<ReviewsPage />} />
                          <Route path="/content" element={<ContentPage />} />
                          {/* <Route path="/staff" element={<StaffPage />} /> */}
                          <Route path="/reports" element={<ReportsPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/newuser" element={<NewUser />} />
                          <Route path="/user" element={<MainUsersPage />} />
                          {/* Product Page */}
                          <Route path="/products" element={<ProductsPage />} />
                          <Route
                            path="/addproduct"
                            element={<ProductManagementForm mode="add" />}
                          />
                          <Route
                            path="/edit-product/:id"
                            element={<ProductManagementFormEdit mode="edit" />}
                          />
                          <Route
                            path="/view-product/:id"
                            element={<ViewProductPage />}
                          />
                          {/* BANNER  */}
                          <Route
                            path="/addbanner"
                            element={<AddBannerPage />}
                          />
                          <Route
                            path="/edit-banner/:id"
                            element={<BannerFormPage />}
                          />
                          {/* Slider */}
                          <Route
                            path="/addslider"
                            element={<AddSliderPage />}
                          />
                          <Route
                            path="/edit-slider/:id"
                            element={<EditSliderPage />}
                          />
                          {/* Blog  */}
                          <Route path="/addblog" element={<AddBlogPage />} />
                          <Route
                            path="/edit-blog/:id"
                            element={<EditBlogPage />}
                          />
                          <Route
                            path="/add-tag"
                            element={<AddProductTagPage />}
                          />
                          <Route
                            path="/edit-tag/:id"
                            element={<EditProductTagPage />}
                          />
                          {/* <Route path="/add-product" element={<ProductForm />} /> */}
                          <Route
                            path="/edit-user/:id"
                            element={<EditUserPage />}
                          />{" "}
                          <Route path="/view-user/:id" element={<ViewUser />} />
                          <Route
                            path="/producttags"
                            element={<ProductTagsPage />}
                          />
                          <Route
                            path="/add-tag"
                            element={<AddProductTagPage />}
                          />
                          <Route
                            path="/edit-tag/:id"
                            element={<EditProductTagPage />}
                          />
                          {/* Seasons */}
                          <Route path="/seasons" element={<SeasonTable />} />
                          <Route path="/add-seasons" element={<AddSeason />} />
                          <Route
                            path="/edit-seasons/:id"
                            element={<EditSeason />}
                          />
                          {/* Fabric */}
                          <Route path="/fabric" element={<FabricsPage />} />
                          <Route path="/add-fabric" element={<AddFabric />} />
                          <Route
                            path="/edit-fabric/:id"
                            element={<EditFabric />}
                          />
                          <Route
                            path="/add-seasons"
                            element={<AddProductTagPage />}
                          />
                          <Route
                            path="/edit-seasons/:id"
                            element={<EditProductTagPage />}
                          />
                          <Route path="/discounts" element={<DiscountPage />} />
                          <Route
                            path="/discounts/view/:id"
                            element={<DiscountViewModal />}
                          />
                          <Route
                            path="/discounts/edit/:id"
                            element={<EditDiscountPage />}
                          />
                          <Route
                            path="/discounts/add"
                            element={<AddDiscountPage />}
                          />
                          <Route path="/brands" element={<BrandsPage />} />
                          <Route
                            path="/add-brands"
                            element={<AddBrandPage />}
                          />
                          <Route
                            path="/upload-brands"
                            element={<UploadBrandPage />}
                          />
                          <Route
                            path="/edit-brands/:id"
                            element={<EditBrandPage />}
                          />
                          <Route
                            path="/permissionsettings"
                            element={<PermissionSettingsPage />}
                          />
                          <Route path="/colors" element={<ColorsTable />} />
                          <Route path="/add-color" element={<AddColor />} />
                          <Route
                            path="/edit-color/:id"
                            element={<EditColor />}
                          />
                          <Route path="/sizes" element={<SizesTable />} />
                          <Route path="/add-size" element={<AddSize />} />
                          <Route path="/edit-size/:id" element={<EditSize />} />
                          {/*Category Routes */}
                          <Route
                            path="/headcategory"
                            element={<HeadCategoriesPage />}
                          />
                          <Route
                            path="/add-headcategory"
                            element={<AddHeadCategoryPage />}
                          />
                          <Route
                            path="/edit-headcategory/:id"
                            element={<EditHeadCategoryPage />}
                          />
                          <Route
                            path="/add-parentcategory"
                            element={<AddParentCategory />}
                          />
                          <Route
                            path="/edit-parentcategory/:id"
                            element={<EditParentCategory />}
                          />
                          <Route
                            path="/parentcategory"
                            element={<ParentCategoriesPage />}
                          />
                          <Route
                            path="/childcategory"
                            element={<ChildCategoriesPage />}
                          />
                          <Route
                            path="/add-childcategory"
                            element={<AddChildCategory />}
                          />
                          <Route
                            path="/edit-childcategory/:id"
                            element={<EditChildCategoryPage />}
                          />
                          {/* Role */}
                          <Route path="/roles" element={<RoleTable />} />
                          <Route path="/add-roles" element={<AddRoles />} />
                          <Route
                            path="/edit-roles/:id"
                            element={<EditRole />}
                          />
                          {/* Stock Alert */}
                          <Route
                            path="/stockalert"
                            element={<StockAlertPage />}
                          />
                          {/* notification */}
                          <Route
                            path="/notification"
                            element={<NotificationsPage />}
                          />
                          {/* Subscriber */}
                          <Route
                            path="/subscriber"
                            element={<SubscribersTable />}
                          />
                          {/* blog comment */}
                          <Route
                            path="/postcomment"
                            element={<BlogCommentsTable />}
                          />
                          <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                          />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
