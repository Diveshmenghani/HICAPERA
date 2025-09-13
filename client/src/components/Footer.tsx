import { motion } from 'framer-motion';

export default function Footer() {
  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'How it Works', href: '#' },
        { name: 'Smart Contract', href: '#' },
        { name: 'Audit Report', href: '#' },
        { name: 'Documentation', href: '#' },
      ]
    },
    {
      title: 'Community',
      links: [
        { name: 'Discord', href: '#' },
        { name: 'Telegram', href: '#' },
        { name: 'Twitter', href: '#' },
        { name: 'GitHub', href: '#' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', href: '#' },
        { name: 'Privacy Policy', href: '#' },
        { name: 'Risk Disclosure', href: '#' },
        { name: 'Contact', href: '#' },
      ]
    }
  ];

  return (
    <footer className="py-16 px-4 border-t border-border relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div>
            <motion.h3 
              className="text-lg font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              HicaperaMLM
            </motion.h3>
            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Decentralized investment platform with multi-level referral rewards built on Ethereum.
            </motion.p>
          </div>

          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (sectionIndex + 1) * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold mb-3">{section.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (sectionIndex + 1) * 0.1 + linkIndex * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <a 
                      href={link.href} 
                      className="hover:text-primary transition-colors"
                      data-testid={`footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-muted-foreground">
            © 2024 HicaperaMLM. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded animate-pulse-neon">
              BETA
            </span>
            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
              AUDITED
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
