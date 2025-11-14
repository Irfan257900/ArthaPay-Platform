import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { apiClient } from '../../http.clients'
import AppEmpty from '../../shared/appEmpty'
import { deriveErrorMessage } from '../../shared/deriveErrorMessage'
import AppAlert from '../../shared/appAlert'

const Agreement = ({ accountType }) => {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAgreement()
  }, [accountType])

  const fetchAgreement = async () => {
    setLoading(true)
    setError(null)
    let url = ""
    if (accountType === "Personal") {
      url = `/api/v1/Aggrement?Type=personal`
    } else if (accountType === "Business") {
      url = `/api/v1/Aggrement?Type=business`
    } else if (accountType === "Employee") {
      url = `/api/v1/Aggrement?Type=personal`
    } else {
      setError("Invalid account type")
      setLoading(false)
      return
    }
    try {
      const response = await apiClient.get(url)
      if (response.ok) {
        let html = response?.data?.templateContent
        html = html.replace(/className=/g, 'class=').replace(/\\"/g, '"')
        html = html.replace(/href=\{`([^`]+)`\}/g, 'href="$1"')
        setContent(html)
      } else {
        setError(deriveErrorMessage(response))
      }

    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  const clearErrorMsg = useCallback(() => {
    setError(null)
  }, [])
  if (loading) return <div className="mt-8">Loading...</div>

  return (
    <>

      <div>
        {
          error && <div className="alert-flex mb-24">
            <AppAlert
              type="error"
              description={error}
              onClose={clearErrorMsg}
              showIcon
            />
            <span className="icon sm alert-close c-pointer" onClick={clearErrorMsg}></span>
          </div>
        }
        {!error && <div dangerouslySetInnerHTML={{ __html: content }} />}
        {!content && <AppEmpty description="No Agreement Found!" className="mt-8" />}
      </div>

    </>
  )
}

export default Agreement
