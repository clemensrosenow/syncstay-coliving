'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link as LinkIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const teamMembers = [
  {
    initials: 'EU',
    name: 'Eric Uphoff',
    role: 'Requirements Engineer',
    color: 'bg-blue-500',
    skills: ['System Design', 'Requirements', 'Agile'],
    bio: 'Leidenschaftlicher Requirements Engineer mit Fokus auf User-zentrierte Produktentwicklung.',
  },
  {
    initials: 'BH',
    name: 'Benedict Hörbelt',
    role: 'Project Lead',
    color: 'bg-purple-500',
    skills: ['Leadership', 'Scrum', 'Strategy'],
    bio: 'Erfahrener Project Lead mit Begeisterung für agile Methoden und Teamdynamik.',
  },
  {
    initials: 'LS',
    name: 'Luca Schmitt',
    role: 'PMO & UX/UI Design',
    color: 'bg-green-500',
    skills: ['Figma', 'UX Research', 'Design Systems'],
    bio: 'Designer mit einem Auge fürs Detail und dem Gespür für nutzerzentrierte Erlebnisse.',
  },
  {
    initials: 'CR',
    name: 'Clemens Rosenow',
    role: 'System Architect',
    color: 'bg-orange-500',
    skills: ['Cloud Architecture', 'Microservices', 'DevOps'],
    bio: 'Architekt komplexer verteilter Systeme mit Fokus auf Skalierbarkeit und Resilienz.',
  },
  {
    initials: 'AS',
    name: 'Antonios Schinarakis',
    role: 'Senior Developer',
    color: 'bg-red-500',
    skills: ['React', 'TypeScript', 'Node.js'],
    bio: 'Full-Stack Developer mit Leidenschaft für sauberen Code und moderne Web-Technologien.',
  },
]

export function TeamSection() {
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null)

  return (
    <section id="team" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">Team</Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
            Das Team hinter SyncStay
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Fünf Studierende der DHBW Mannheim mit einer gemeinsamen Vision: Nomaden verbinden.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6">
          {teamMembers.map((member, i) => (
            <motion.button
              key={member.initials}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
              whileHover={{ rotateY: 4, scale: 1.04 }}
              onClick={() => setSelectedMember(member)}
              className="bg-background rounded-2xl border border-border shadow-sm p-8 flex flex-col items-center text-center w-44 cursor-pointer hover:shadow-md transition-shadow duration-300"
            >
              <div className={`w-16 h-16 ${member.color} rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 shadow-md`}>
                {member.initials}
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">{member.name}</h3>
              <p className="text-muted-foreground text-xs">{member.role}</p>
            </motion.button>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
              onClick={() => setSelectedMember(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background rounded-2xl p-8 max-w-md w-full shadow-2xl border border-border"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 ${selectedMember.color} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                      {selectedMember.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-foreground">{selectedMember.name}</h3>
                      <p className="text-muted-foreground text-sm">{selectedMember.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Modal schließen"
                  >
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>

                <p className="text-foreground/80 text-sm leading-relaxed mb-6">{selectedMember.bio}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedMember.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>

                <button className="flex items-center gap-2 text-primary text-sm font-medium hover:text-primary/80 transition-colors">
                  <LinkIcon size={16} />
                  LinkedIn-Profil
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
