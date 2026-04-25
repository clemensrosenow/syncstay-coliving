'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarImage } from "@/components/ui/avatar"

const teamMembers = [
  {
    name: 'Benedict Hörbelt',
    role: 'Project Lead',
    image: '/images/team/benedict.png',
  },
  {
    name: 'Luca Schmitt',
    role: 'PMO & UX/UI Design',
    image: '/images/team/luca.png',
  }, 
  {
    name: 'Eric Uphoff',
    role: 'Requirements Engineer',
    image: '/images/team/eric.jpg',
  },
  {
    name: 'Clemens Rosenow',
    role: 'System Architect',
    image: '/images/team/clemens.png',
  },
  {
    name: 'Antonios Schinarakis',
    role: 'Senior Developer',
    image: '/images/team/antonios.png',
  },
]

export function TeamSection() {
  return (
    <section id="team" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Our Team</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Built by nomads, for nomads
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            We are five DHBW Mannheim students united by a single mission: redefining how digital nomads live and connect across the globe.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-y-12 sm:gap-x-6 md:gap-x-12 w-full max-w-3xl mx-auto">
          {teamMembers.map((member, index) => {
            let colClass = "sm:col-span-2"
            if (index === 0) colClass += " sm:col-start-2"
            
            return (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                className={`flex flex-col items-center text-center ${colClass}`}
              >
                <Avatar className="size-32 md:size-40 mb-6 shadow-sm border border-border/50">
                  {member.image && <AvatarImage src={member.image} alt={member.name} className="object-cover" />}
                </Avatar>
                <strong className="text-lg font-semibold text-foreground mb-1">{member.name}</strong>
                <span className="text-sm text-muted-foreground">{member.role}</span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

