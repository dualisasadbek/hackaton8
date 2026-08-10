import AuthService from '../services/auth.service.js'
import TokenService from '../services/token.service.js'
import { catchAsync } from '../utils/catchAsync.js'

class AuthController {
  register = catchAsync(async (req, res) => {
    const { data, refreshToken } = await AuthService.register(req.body, req)
    const accessToken = TokenService.signAccessToken({ id: data.id, type: 'user' })

    TokenService.setAuthCookies(res, accessToken, refreshToken)

    res.status(201).json({
      success: true,
      message: 'Foydalanuvchi muvaffaqiyatli yaratildi',
      data,
      accessToken,
    })
  })

  login = catchAsync(async (req, res) => {
    const { data, refreshToken } = await AuthService.login(req.body, req)
    const accessToken = TokenService.signAccessToken({ id: data.id, type: 'user' })

    TokenService.setAuthCookies(res, accessToken, refreshToken)

    res.status(200).json({
      success: true,
      message: 'Muvaffaqiyatli kirish',
      data,
      accessToken,
    })
  })

  adminLogin = catchAsync(async (req, res) => {
    const { data, refreshToken } = await AuthService.adminLogin(req.body, req)
    const accessToken = TokenService.signAccessToken({ id: data.id, type: 'admin' })

    TokenService.setAuthCookies(res, accessToken, refreshToken)

    res.status(200).json({
      success: true,
      message: 'Admin muvaffaqiyatli kirdi',
      data,
      accessToken,
    })
  })

  refresh = catchAsync(async (req, res) => {
    const oldRefresh = req.cookies.refreshToken
    const { accessToken, refreshToken } = await AuthService.refresh(oldRefresh, req)

    TokenService.setAuthCookies(res, accessToken, refreshToken)

    res.status(200).json({
      success: true,
      message: 'Tokenlar yangilandi',
      accessToken,
    })
  })

  logout = catchAsync(async (req, res) => {
    await AuthService.logout(req.cookies.refreshToken)
    TokenService.clearAuthCookies(res)

    res.status(200).json({ success: true, message: 'Chiqildi' })
  })

  me = catchAsync(async (req, res) => {
    const result = await AuthService.getMe(req)

    res.status(200).json({
      success: true,
      data: {
        type: result.type,
        ...result.data,
      },
    })
  })
}

export default new AuthController()
