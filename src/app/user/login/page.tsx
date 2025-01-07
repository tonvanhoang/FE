'use client';
import '../login/login.css';
import Link from 'next/link';
import { useFormik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Define types for the form values and possible API responses
interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    avata: string;
  };
}

interface ErrorResponse {
  message: string;
}

interface HelpRequestFormValues {
  email: string;
  content: string; // Reason for unlock request
  image: File | null;
}

export default function Login() {
  const router = useRouter();
  const [lockedOut, setLockedOut] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  useEffect(() => {
    const attempts = Number(localStorage.getItem('loginAttempts')) || 0;
    setLoginAttempts(attempts);
  }, []);

  useEffect(() => {
    if (lockedOut) {
      const unlockTimer = setTimeout(() => {
        setLockedOut(false);
        setLoginAttempts(0);
        localStorage.removeItem('loginAttempts');
      }, 300000); // Lockout for 5 minutes

      return () => clearTimeout(unlockTimer);
    }
  }, [lockedOut]);

  const handleLoginAttempt = (newAttempts: number) => {
    localStorage.setItem('loginAttempts', newAttempts.toString());
    setLoginAttempts(newAttempts);
  };

  // Formik setup for login form
  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
      password: Yup.string().required('Bắt buộc'),
    }),
    onSubmit: async (values: LoginFormValues, { setSubmitting }: FormikHelpers<LoginFormValues>) => {
      try {
        if (lockedOut) {
          throw new Error('Bạn đã bị khóa vì quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau.');
        }

        const res = await fetch('http://localhost:4000/account/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!res.ok) {
          const errorData: ErrorResponse = await res.json();
          throw new Error(errorData.message || 'Đăng nhập thất bại');
        }

        const data: LoginResponse = await res.json();
        
        // Save token and user information to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        handleLoginAttempt(0); // Reset attempts on successful login
        router.push('/user/homePage');
        alert('Đăng Nhập thành công!');

        setLoginError(null); // Clear any previous error messages
      } catch (error: any) {
        handleLoginAttempt(loginAttempts + 1);
        if (loginAttempts + 1 >= 3) {
          setLockedOut(true);
          alert('Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.');
        }
        setLoginError(error.message || 'Thông tin đăng nhập không chính xác. Vui lòng thử lại.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const helpFormik = useFormik<HelpRequestFormValues>({
    initialValues: {
      email: '',
      content: '',  
      image: null,  
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
      content: Yup.string().required('Nội dung không được bỏ trống'), 
    }),
    onSubmit: async (values) => {
      const unlockRequestPayload = {
        email: values.email,
        reason: values.content, 
        imageUrl: values.image ? URL.createObjectURL(values.image) : null, 
      };

      try {
        const res = await fetch('http://localhost:4000/account/requestUnlock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(unlockRequestPayload), 
        });

        if (!res.ok) {
          const errorData: ErrorResponse = await res.json();
          throw new Error(errorData.message || 'Đã xảy ra lỗi khi gửi yêu cầu trợ giúp.');
        }

        const data = await res.json();
        
        alert('Yêu cầu mở khóa đã được gửi thành công!');
        setShowHelpModal(false); 
      } catch (error: any) {
        alert(error.message || 'Đã xảy ra lỗi khi gửi yêu cầu trợ giúp.');
      }
    },
  });

  useEffect(() => {
    if (loginError) {
      const errorTimeout = setTimeout(() => {
        setLoginError(null);
      }, 5000);

      return () => clearTimeout(errorTimeout);
    }
  }, [loginError]);

  return (
    <>
      <div className="container" id="loginPage">
        <div className="container_con d-flex">
          <div className="container_left">
            <div className="my-3">
              <h2>Xin chào bạn đã đến với Renet</h2>
            </div>
            <div className="img">
              <img src="../img/khungdienthoai.jpg" alt="" />
              <div className="con">
                <div className="carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
                  <div className="carousel-inner">
                    <div className="carousel-item active">
                      <img src="/img/screenshot1.png" className="d-block w-100" alt="..." />
                    </div>
                    <div className="carousel-item">
                      <img src="/img/screenshot2.png" className="d-block w-100" alt="..." />
                    </div>
                    <div className="carousel-item">
                      <img src="/img/screenshot3.png" className="d-block w-100" alt="..." />
                    </div>
                    <div className="carousel-item">
                      <img src="/img/screenshot4.png" className="d-block w-100" alt="..." />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 container_right p-0">
            <form onSubmit={formik.handleSubmit}>
              <div className="item-1 m-auto">
                <h2 className="text-center my-4">Renet</h2>

                <div className="mb-2 m-auto">
                  <label>Gmail</label>
                  <input
                    type="text"
                    id="email"
                    placeholder="Vui lòng nhập gmail..."
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={formik.touched.email && formik.errors.email ? 'is-invalid' : ''}
                    disabled={lockedOut}
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <span className="text-danger">{formik.errors.email}</span>
                  ) : null}
                </div>

                <div className="mb-3 m-auto">
                  <label>Mật khẩu</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Vui lòng nhập mật khẩu..."
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={formik.touched.password && formik.errors.password ? 'is-invalid' : ''}
                    disabled={lockedOut}
                  />
                  {formik.touched.password && formik.errors.password ? (
                    <span className="text-danger">{formik.errors.password}</span>
                  ) : null}
                </div>

                {loginError && (
                  <div className="text-danger text-center mb-2">
                    {loginError}
                  </div>
                )}

                <div className="quenmatkhau m-auto">
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                  >
                    Trợ Giúp
                  </button>
                  <a href="#/" className="text-decoration-none">
                    Quên mật khẩu?
                  </a>
                </div>

                <div className="text-center btnLogin">
                  <button
                  type="submit"
                  disabled={formik.isSubmitting || lockedOut}
                  style={{
                    color: 'white',        
                    fontWeight: 'bold',    
                  }}
                >
                  Đăng Nhập
                </button>
                </div>
              </div>
            </form>

            <div className="item-2 my-4 row">
              <div className="col-4"></div>
              <div className="col-1 p-0 text-center">OR</div>
              <div className="col-4"></div>
            </div>
            <div className="my-3 item-3">
              <button>
                Bạn có tài khoản chưa?
                <Link href='/user/register' className="text-decoration-none">Đăng ký</Link>
              </button>
            </div>
            <div className="my-3 item-4">
              <button>
                <div className="img">
                  <img src="../img/facebook.avif" alt="" />
                </div>
                <a href="#">Đăng nhập bằng Facebook</a>
              </button>
            </div>
            <div className="my-3 item-5">
              <button>
                <div className="img">
                  <img src="../img/google.png" alt="" />
                </div>
                <a href="#">Đăng nhập bằng Google</a>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Help Request */}
{showHelpModal && (
  <div className="modal" style={{ display: 'block' }}>
    <div className="modal-content">
      <span className="close" onClick={() => setShowHelpModal(false)}>&times;</span>
      <h2>Yêu cầu mở khóa tài khoản</h2>
      <form onSubmit={helpFormik.handleSubmit}>
        <div className="mb-2">
          <label>Email</label>
          <input
            type="email"
            id="email"
            placeholder="Vui lòng nhập email của bạn..."
            value={helpFormik.values.email}
            onChange={helpFormik.handleChange}
            onBlur={helpFormik.handleBlur}
            className={helpFormik.touched.email && helpFormik.errors.email ? 'is-invalid' : ''}
          />
          {helpFormik.touched.email && helpFormik.errors.email && (
            <div className="text-danger">{helpFormik.errors.email}</div>
          )}
        </div>

        <div className="mb-2">
          <label>Lý do yêu cầu mở khóa</label>
          <textarea
            id="content" // Make sure the id matches the key in the form values
            placeholder="Mô tả lý do yêu cầu mở khóa..."
            value={helpFormik.values.content}
            onChange={helpFormik.handleChange}
            onBlur={helpFormik.handleBlur}
            className={helpFormik.touched.content && helpFormik.errors.content ? 'is-invalid' : ''}
          />
          {helpFormik.touched.content && helpFormik.errors.content && (
            <div className="text-danger">{helpFormik.errors.content}</div>
          )}
        </div>

        <div className="mb-2">
          <label>Hình ảnh minh họa (tuỳ chọn)</label>
          <input
            type="file"
            id="image"
            onChange={(event) => helpFormik.setFieldValue('image', event.currentTarget.files?.[0] || null)}
          />
        </div>

        <div className="text-center">
          <button type="submit" disabled={helpFormik.isSubmitting}>
            Gửi yêu cầu
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </>
  );
}
