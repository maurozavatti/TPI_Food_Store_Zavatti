import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '@/store/notificationStore'
import { requestRegister } from '../api/auth'

export const useRegister = () => {
  const navigate = useNavigate()
  const showNotification = useNotificationStore((s) => s.showNotification)

  return useMutation({
    mutationFn: requestRegister,
    onSuccess: (usuario) => {
      showNotification('Cuenta creada. Ya podés iniciar sesión.', 'success')
      // al login, con el usuario precargado
      navigate('/login', { replace: true, state: { registrado: usuario.username } })
    },
  })
}