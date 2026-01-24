import Link from 'next/link'
import { Car, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
    'Jelajahi': [
        { label: 'Mobil Baru', href: '/mobil-baru' },
        { label: 'Mobil Bekas', href: '/mobil-bekas' },
        { label: 'Bandingkan Mobil', href: '/compare' },
        { label: 'Kalkulator Kredit', href: '/calculator' },
    ],
    'Merk Populer': [
        { label: 'Toyota', href: '/brand/toyota' },
        { label: 'Honda', href: '/brand/honda' },
        { label: 'Daihatsu', href: '/brand/daihatsu' },
        { label: 'Mitsubishi', href: '/brand/mitsubishi' },
        { label: 'Suzuki', href: '/brand/suzuki' },
    ],
    'Informasi': [
        { label: 'Tentang Kami', href: '/about' },
        { label: 'Cara Kerja', href: '/how-it-works' },
        { label: 'Syarat & Ketentuan', href: '/terms' },
        { label: 'Kebijakan Privasi', href: '/privacy' },
        { label: 'FAQ', href: '/faq' },
    ],
    'Layanan': [
        { label: 'Jual Mobil', href: '/sell' },
        { label: 'Daftar Dealer', href: '/register?role=dealer' },
        { label: 'Iklan', href: '/advertise' },
        { label: 'Bantuan', href: '/help' },
    ],
}

const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/cepetdeal', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/cepetdeal', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com/cepetdeal', label: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com/cepetdeal', label: 'YouTube' },
]

export function Footer() {
    return (
        <footer className="bg-secondary text-white">
            {/* Main Footer */}
            <div className="container py-12">
                <div className="grid py-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                    {/* Brand & Contact */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">CepetDeal</span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Platform jual beli mobil baru dan bekas terpercaya di Indonesia.
                            Temukan mobil impian Anda dengan harga terbaik.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <a
                                href="tel:02112345678"
                                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm"
                            >
                                <Phone className="w-4 h-4" />
                                <span>021-12345678</span>
                            </a>
                            <a
                                href="mailto:hello@cepetdeal.com"
                                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm"
                            >
                                <Mail className="w-4 h-4" />
                                <span>hello@cepetdeal.com</span>
                            </a>
                            <div className="flex items-start gap-3 text-gray-400 text-sm">
                                <MapPin className="w-4 h-4 mt-0.5" />
                                <span>Jl. Sudirman No. 123, Jakarta Pusat</span>
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="font-semibold mb-4">{title}</h3>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors text-sm"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-white/10">
                <div className="container py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Copyright */}
                        <p className="text-gray-400 text-sm text-center md:text-left">
                            © {new Date().getFullYear()} CepetDeal. Hak cipta dilindungi undang-undang.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
