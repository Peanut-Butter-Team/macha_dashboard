import { useState } from 'react';
import { BarChart3, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export function RegisterPage({ onBackToLogin }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    email: '',
    phone: '',
    managerName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://matcha.pnutbutter.kr/api/v1/dash-members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          managerName: formData.managerName,
        }),
      });

      const data = await response.json();

      if (data.responseCode === 200) {
        setSuccess(true);
      } else {
        setError(data.message || '회원가입에 실패했습니다.');
      }
    } catch {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 성공 화면
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-primary-950 mb-2">회원가입 완료</h2>
            <p className="text-slate-600 mb-6">회원가입이 성공적으로 완료되었습니다.</p>
            <button
              onClick={onBackToLogin}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all"
            >
              로그인하러 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 size={32} className="text-white" />
            </div>
            <span className="font-bold text-3xl text-white">Macha</span>
          </div>
          <p className="text-primary-300">브랜드 마케팅 대시보드</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-primary-950 mb-6 text-center">회원가입</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-slate-700 mb-1.5">
                계정 (아이디)
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                value={formData.userId}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                회사명 / 브랜드명
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="회사명 또는 브랜드명을 입력하세요"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="managerName" className="block text-sm font-medium text-slate-700 mb-1.5">
                담당자 이름
              </label>
              <input
                id="managerName"
                name="managerName"
                type="text"
                value={formData.managerName}
                onChange={handleChange}
                placeholder="담당자 이름을 입력하세요"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                연락처
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="010-0000-0000"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                비밀번호 확인
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all"
            >
              로그인으로 돌아가기
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-400 text-sm mt-6">
          © 2024 Macha Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}
