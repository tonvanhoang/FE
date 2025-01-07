
// Define types for form values
'use client';
import '../register/register.css';
import React from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface FormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const formik = useFormik<FormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .min(2, 'Họ phải có ít nhất 2 ký tự')
        .max(50, 'Họ không được quá 50 ký tự')
        .required('Vui lòng nhập họ'),
      lastName: Yup.string()
        .min(2, 'Tên phải có ít nhất 2 ký tự')
        .max(50, 'Tên không được quá 50 ký tự')
        .required('Vui lòng nhập tên'),
      phoneNumber: Yup.string()
        .matches(/^\d{10,11}$/, 'Số điện thoại phải có 10 hoặc 11 số')
        .required('Vui lòng nhập số điện thoại'),
      email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
      password: Yup.string()
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/,
          'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ, số và ký tự đặc biệt'
        )
        .required('Vui lòng nhập mật khẩu'),
        confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), undefined], 'Mật khẩu không khớp')
        .required('Vui lòng xác nhận mật khẩu'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        setSubmitting(true);
        const response = await fetch('http://localhost:4000/account/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 400 && errorData.message === 'Email đã tồn tại') {
            setFieldError('email', 'Email đã tồn tại');
          } else {
            throw new Error(errorData.message || 'Đăng ký thất bại');
          }
        } else {
          alert('Đăng ký thành công!');
        }
      } catch (error) {
        console.error('Registration error:', error);
        setFieldError('general', (error as Error).message || 'Đăng ký thất bại');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="container" id="registerPage">
      <div className="container_con m-auto">
        <div className="formregister p-0">
          <div className="item-1 m-auto">
            <h2 className="text-center my-4">Renet</h2>
            <form onSubmit={formik.handleSubmit}>
              <div className="mb-3 m-auto">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Vui lòng nhập họ..."
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.firstName}
                  className={formik.touched.firstName && formik.errors.firstName ? 'error' : ''}
                />
                {formik.touched.firstName && formik.errors.firstName ? (
                  <span className="text-danger">{formik.errors.firstName}</span>
                ) : null}
              </div>
              <div className="mb-3 m-auto">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Vui lòng nhập tên..."
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.lastName}
                  className={formik.touched.lastName && formik.errors.lastName ? 'error' : ''}
                />
                {formik.touched.lastName && formik.errors.lastName ? (
                  <span className="text-danger">{formik.errors.lastName}</span>
                ) : null}
              </div>
              <div className="mb-3 m-auto">
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Vui lòng nhập số điện thoại..."
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phoneNumber}
                  className={formik.touched.phoneNumber && formik.errors.phoneNumber ? 'error' : ''}
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                  <span className="text-danger">{formik.errors.phoneNumber}</span>
                ) : null}
              </div>
              <div className="mb-3 m-auto">
                <input
                  type="email"
                  name="email"
                  placeholder="Vui lòng nhập email..."
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className={formik.touched.email && formik.errors.email ? 'error' : ''}
                />
                {formik.touched.email && formik.errors.email ? (
                  <span className="text-danger">{formik.errors.email}</span>
                ) : null}
              </div>

              <div className="mb-3 m-auto">
                <input
                  type="password"
                  name="password"
                  placeholder="Vui lòng nhập mật khẩu..."
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className={formik.touched.password && formik.errors.password ? 'error' : ''}
                />
                {formik.touched.password && formik.errors.password ? (
                  <span className="text-danger">{formik.errors.password}</span>
                ) : null}
              </div>
              <div className="mb-3 m-auto">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu..."
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  className={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'error' : ''}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                  <span className="text-danger">{formik.errors.confirmPassword}</span>
                ) : null}
              </div>

              <div className="text-center btnLogin">
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  style={{
                    color: 'white',         
                    fontWeight: 'bold',     
                  }}
                >
                  Đăng Ký
                </button>
              </div>
            </form>
          </div>

          <div className="item-2 row">
            <div className="col-4"></div>
            <div className="col-1 p-0 text-center">OR</div>
            <div className="col-4"></div>
          </div>

          <div className="mb-3 item-3">
            <button>
              Bạn đã có tài khoản? <Link href="/user/login" className="text-decoration-none">Đăng Nhập</Link>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Register;