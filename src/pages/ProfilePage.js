// "use client";

// import { useRef, useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "../components/ui/Card";
// import Input from "../components/ui/Input";
// import Button from "../components/ui/Button";
// import { Mail, Phone, Calendar, User, Eye, EyeOff } from "lucide-react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // ✅ Intl phone input
// import "react-phone-input-2/lib/style.css";
// import PhoneInput from "react-phone-input-2";

// const ProfilePage = () => {
//   const fileInputRef = useRef(null);
//   const [selectedImage, setSelectedImage] = useState(
//     "https://tyka.premierwebtechservices.com/backend/storage/img/default-avatar.jpg"
//   );

//   const [profile, setProfile] = useState({
//     id: "",
//     name: "",
//     email: "",
//     phone: "",
//     gender: "",
//     role: "",
//     memberSince: "",
//     addresses: [],
//   });

//   const [isEditable, setIsEditable] = useState(false);
//   const [avatarFile, setAvatarFile] = useState(null);
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   // ✅ Fetch user data
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const storedUser = JSON.parse(localStorage.getItem("userData"));

//         const userId = storedUser?.id; // 🔹 Replace with logged-in user id
//         const token = localStorage.getItem("token");

//         const res = await axios.get(
//           `https://tyka.premierwebtechservices.com/backend/api/users/${userId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         console.log("seuzdgf78gwe8sfugweysf", res.data);
//         debugger;
//         if (res.data?.data) {
//           const user = res.data.data;
//           setProfile({
//             id: user.id,
//             name: user.name || "",
//             email: user.email || "",
//             phone: user.phone || "",
//             gender: user.gender || "",
//             role: user.roles?.[0]?.role_name || "User",
//             memberSince: user.created_at
//               ? new Date(user.created_at).toISOString().split("T")[0]
//               : "",
//             addresses: user.user_address?.data || [],
//           });
//           if (user.avatar) {
//             setSelectedImage(user.avatar);
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching profile:", error);
//         toast.error("Failed to load profile");
//       }
//     };
//     fetchProfile();
//   }, []);

//   // ✅ Image upload preview
//   const handleImageClick = () => fileInputRef.current.click();

//   const handleImageChange = (event) => {
//     const file = event.target.files[0];
//     if (file && file.type.startsWith("image/")) {
//       setAvatarFile(file); // store file

//       // preview
//       const reader = new FileReader();
//       reader.onload = () => setSelectedImage(reader.result);
//       reader.readAsDataURL(file);
//     }
//   };

//   // ✅ Handle input change
//   const handleProfileChange = (e) => {
//     const { name, value } = e.target;
//     setProfile((prev) => ({ ...prev, [name]: value }));
//   };

//   // ✅ Save/Update profile
//   const handleSaveProfile = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const formData = new FormData();
//       formData.append("name", profile.name || "");
//       formData.append("email", profile.email || "");
//       formData.append("phone", profile.phone || "");
//       formData.append("gender", profile.gender || "");
//       formData.append("_method", "PUT"); // ✅ Laravel expects this for update

//       if (password) {
//         formData.append("password", password);
//       }
//       if (avatarFile) {
//         formData.append("avatar", avatarFile); // ✅ must be file
//       }

//       const res = await fetch(
//         `https://tyka.premierwebtechservices.com/backend/api/users/${profile.id}`,
//         {
//           method: "POST", // ✅ send as POST, override with _method=PUT
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: formData,
//         }
//       );

//       const data = await res.json();
//       console.log("data", data);

//       if (res.ok && data.success) {
//         toast.success("🎉 Profile updated successfully!");

//         if (data?.data?.avatar) {
//           setSelectedImage(data.data.avatar); // ✅ updated avatar from backend
//         }

//         setIsEditable(false);
//         setPassword("");
//       } else {
//         toast.error(data?.message || "❌ Failed to update profile");
//       }
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       toast.error("❌ Failed to update profile");
//     }
//   };

//   return (
//     <div className="space-y-6 p-4 sm:p-6 md:p-8">
//       <ToastContainer position="top-right" autoClose={3000} />

//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">
//             Profile Settings
//           </h1>
//           <p className="text-muted-foreground">
//             Manage your account information and preferences.
//           </p>
//         </div>
//       </div>

//       {/* Profile Overview */}
//       <Card>
//         <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
//           <div className="relative">
//             <img
//               src={selectedImage}
//               alt="Avatar"
//               onClick={handleImageClick}
//               className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-md cursor-pointer hover:opacity-80"
//             />
//             <input
//               type="file"
//               accept="image/*"
//               ref={fileInputRef}
//               onChange={handleImageChange}
//               className="hidden"
//             />
//             <p className="text-xs text-center text-muted-foreground mt-1">
//               Click to change
//             </p>
//           </div>
//           <div className="flex-1">
//             <CardTitle className="text-2xl">{profile.name}</CardTitle>
//             <CardDescription className="text-lg text-muted-foreground">
//               {profile.role}
//             </CardDescription>
//             <div className="flex items-center text-sm text-muted-foreground mt-2">
//               <Calendar className="h-4 w-4 mr-1" /> Member since:{" "}
//               {profile.memberSince}
//             </div>
//           </div>
//           <Button variant="outline" onClick={() => setIsEditable(!isEditable)}>
//             {isEditable ? "Cancel" : "Edit Profile"}
//           </Button>
//         </CardHeader>
//         <CardContent>
//           <div className="border-t my-4"></div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex items-center text-sm text-muted-foreground">
//               <Mail className="h-4 w-4 mr-2" /> {profile.email}
//             </div>
//             <div className="flex items-center text-sm text-muted-foreground">
//               <Phone className="h-4 w-4 mr-2" /> {profile.phone}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Edit Mode */}
//       {isEditable && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <User className="h-5 w-5 text-primary" /> General Information
//             </CardTitle>
//             <CardDescription>Update your personal details.</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <label htmlFor="name" className="text-sm font-medium">
//                   Full Name
//                 </label>
//                 <Input
//                   id="name"
//                   name="name"
//                   value={profile.name}
//                   onChange={handleProfileChange}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label htmlFor="email" className="text-sm font-medium">
//                   Email
//                 </label>
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={profile.email}
//                   onChange={handleProfileChange}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label htmlFor="phone" className="text-sm font-medium">
//                   Phone Number
//                 </label>
//                 <PhoneInput
//                   country={"in"}
//                   value={profile.phone}
//                   onChange={(value) =>
//                     setProfile((prev) => ({ ...prev, phone: value }))
//                   }
//                   inputStyle={{
//                     width: "100%",
//                     height: "40px",
//                     fontSize: "14px",
//                   }}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label htmlFor="gender" className="text-sm font-medium">
//                   Gender
//                 </label>
//                 <select
//                   id="gender"
//                   name="gender"
//                   value={profile.gender}
//                   onChange={handleProfileChange}
//                   className="w-full border rounded px-3 py-2 text-sm"
//                 >
//                   <option value="">Select Gender</option>
//                   <option value="Male">Male</option>
//                   <option value="Female">Female</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div className="space-y-2">
//                 <label htmlFor="password" className="text-sm font-medium">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter new password"
//                     className="pr-10"
//                   />
//                   <div
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4 text-gray-500" />
//                     ) : (
//                       <Eye className="h-4 w-4 text-gray-500" />
//                     )}
//                   </div>
//                 </div>
//               </div>
//               {/* ✅ Image input inside edit form */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Profile Picture</label>
//                 <div className="flex flex-col items-start gap-2">
//                   <img
//                     src={selectedImage}
//                     alt="Avatar Preview"
//                     className="w-20 h-20 rounded-full object-cover border shadow"
//                   />
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageChange}
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="mt-6 flex justify-end">
//               <Button onClick={handleSaveProfile}>Save Changes</Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default ProfilePage;

"use client";

import { useRef, useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Mail, Phone, Calendar, User, Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Intl phone input
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

const ProfilePage = () => {
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(
    "http://127.0.0.1:8000/storage/img/default-avatar.jpg"
  );

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    gender: "",
    role: "",
    memberSince: "",
    addresses: [],
  });

  const [isEditable, setIsEditable] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ loader

  // ✅ Fetch user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true); // ✅ start loader
        const storedUser = JSON.parse(localStorage.getItem("userData"));
        const userId = storedUser?.id; // 🔹 Replace with logged-in user id
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://127.0.0.1:8000/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.data) {
          const user = res.data.data;
          setProfile({
            id: user.id,
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            gender: user.gender || "",
            role: user.roles?.[0]?.role_name || "User",
            memberSince: user.created_at
              ? new Date(user.created_at).toISOString().split("T")[0]
              : "",
            addresses: user.user_address?.data || [],
          });
          if (user.avatar) {
            setSelectedImage(user.avatar);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false); // ✅ stop loader
      }
    };
    fetchProfile();
  }, []);

  // ✅ Image upload preview
  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setAvatarFile(file); // store file

      // preview
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Handle input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save/Update profile
  const handleSaveProfile = async () => {
    try {
      setLoading(true); // ✅ start loader
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", profile.name || "");
      formData.append("email", profile.email || "");
      formData.append("phone", profile.phone || "");
      formData.append("gender", profile.gender || "");
      formData.append("_method", "PUT"); // ✅ Laravel expects this for update

      if (password) {
        formData.append("password", password);
      }
      if (avatarFile) {
        formData.append("avatar", avatarFile); // ✅ must be file
      }

      const res = await fetch(
        `http://127.0.0.1:8000/api/users/${profile.id}`,
        {
          method: "POST", // ✅ send as POST, override with _method=PUT
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("🎉 Profile updated successfully!");

        if (data?.data?.avatar) {
          setSelectedImage(data.data.avatar); // ✅ updated avatar from backend
        }

        setIsEditable(false);
        setPassword("");
      } else {
        toast.error(data?.message || "❌ Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("❌ Failed to update profile");
    } finally {
      setLoading(false); // ✅ stop loader
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ✅ Loader */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="loader border-t-4 border-red-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences.
          </p>
        </div>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Avatar"
              onClick={handleImageClick}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-md cursor-pointer hover:opacity-80"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-xs text-center text-muted-foreground mt-1">
              Click to change
            </p>
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl">{profile.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {profile.role}
            </CardDescription>
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <Calendar className="h-4 w-4 mr-1" /> Member since:{" "}
              {profile.memberSince}
            </div>
          </div>
          <Button variant="outline" onClick={() => setIsEditable(!isEditable)}>
            {isEditable ? "Cancel" : "Edit Profile"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border-t my-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" /> {profile.email}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" /> {profile.phone}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Mode */}
      {isEditable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> General Information
            </CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <PhoneInput
                  country={"in"}
                  value={profile.phone}
                  onChange={(value) =>
                    setProfile((prev) => ({ ...prev, phone: value }))
                  }
                  inputStyle={{
                    width: "100%",
                    height: "40px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleProfileChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
              {/* ✅ Image input inside edit form */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Picture</label>
                <div className="flex flex-col items-start gap-2">
                  <img
                    src={selectedImage}
                    alt="Avatar Preview"
                    className="w-20 h-20 rounded-full object-cover border shadow"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ Loader Styles */}
      <style jsx>{`
        .loader {
          border-width: 4px;
          border-top-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
