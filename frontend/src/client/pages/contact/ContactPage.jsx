import { useState } from 'react'
import SEO, { BreadcrumbSchema } from '../../../common/components/SEO'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-navy-50 font-sans pb-16">
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-navy-900 to-navy-800 opacity-90 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-28 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">تواصل معنا</h1>
          <p className="text-lg text-navy-300 max-w-xl mx-auto font-medium">
            فريق قرعة جاهز لمساعدتك والإجابة على استفساراتك حول التقديم على قرعة الهجرة الأمريكية (DV Lottery)
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-navy-100">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="font-bold text-navy-900 mb-2">البريد الإلكتروني</h3>
              <p className="text-navy-500 text-sm mb-3">للاستفسارات والدعم الفني</p>
              <a href="mailto:support@qor3a.com" className="text-primary-600 font-bold hover:text-primary-700 transition-colors" dir="ltr">support@qor3a.com</a>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-navy-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h3 className="font-bold text-navy-900 mb-2">واتساب</h3>
              <p className="text-navy-500 text-sm mb-3">أسرع طريقة للتواصل</p>
              <a href="https://wa.me/967770000000" target="_blank" rel="noopener noreferrer" className="text-green-600 font-bold hover:text-green-700 transition-colors">+967 770 000 000</a>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-navy-100">
              <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center text-navy-600 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-navy-900 mb-2">الموقع</h3>
              <p className="text-navy-500 text-sm">اليمن — صنعاء / عدن</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-xl border border-navy-100">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">أرسل لنا رسالة</h2>
              <p className="text-navy-500 mb-8">املأ النموذج وسنرد عليك في أقرب وقت</p>

              {sent ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">تم إرسال رسالتك!</h3>
                  <p className="text-green-600">شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-navy-900">الاسم الكامل</label>
                      <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="محمد أحمد"
                        className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-navy-900">رقم الهاتف</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="967XXXXXXXXX"
                        className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium" dir="ltr" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-navy-900">البريد الإلكتروني</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-navy-900">الرسالة</label>
                    <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="اكتب رسالتك هنا..."
                      rows={5}
                      className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium resize-none" />
                  </div>
                  <button type="submit"
                    className="w-full bg-primary-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-600 focus:ring-4 focus:ring-primary-500/20 transition-all shadow-lg shadow-primary-500/30">
                    إرسال الرسالة
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
